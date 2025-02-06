import json
import os
import pandas as pd
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http.models import *
from tqdm import tqdm
import openai
from openai import OpenAI
from pathlib import Path
from dotenv import load_dotenv
from sklearn.model_selection import train_test_split

# Enable tqdm for pandas
tqdm.pandas()

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI, Qdrant, and SentenceTransformer
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
qdrant_url = os.environ.get("QDRANT_URL")
qdrant_api_key = os.environ.get("QDRANT_API_KEY")

qdrant = QdrantClient(
    url=qdrant_url,
    api_key=qdrant_api_key,
)
model = SentenceTransformer('all-MiniLM-L6-v2')

# -------------------------
# Step 1: Load Data
# -------------------------

def load_data(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    rows = []
    for framework in data.get('dataset', []):  
        framework_name = framework.get('framework', '')
        for entry in framework.get('data', []):
            title = entry.get('title', '')
            context = entry.get('context', '')
            if not context:
                print(f"Missing context for title: {title}")
            extended_context = f"[{framework_name} Section {title}] {context}"
            paragraphs = entry.get('paragraphs', [])
            if not paragraphs:
                print(f"Missing paragraphs for title: {title}")
            for paragraph in paragraphs:
                qas = paragraph.get('qas', [])
                if not qas:
                    print(f"Missing QAs for title: {title} - Paragraph: {paragraph}")               
                for qa in qas:
                    question = qa.get('question', '')
                    answers = qa.get('answers', [])
                    answer_text = answers[0]['text'] if answers else ''
                    rows.append({
                        "framework": framework_name,
                        "title": title,
                        "question": question,
                        "answer": answer_text,
                        "context": extended_context
                    })

    print(f"Total QAs extracted: {len(rows)}")  
    return pd.DataFrame(rows)


print("Loading data...")
data_file = "ISO_QAS_v6.json"
if not os.path.exists(data_file):
    print(f"Data file {data_file} not found.")
else:
    df = load_data(data_file)
    print(df.head())
    print("Data loaded successfully!")

# -------------------------
# Step 2: Create Qdrant Collection and Upload Embeddings
# -------------------------

embeddings = model.encode(df['question'].tolist())
if len(embeddings) != df.shape[0]:
    print("Mismatch between number of embeddings and dataframe rows.")
    raise ValueError("The number of embeddings does not match the dataset size.")
else:
    print("Embedding size:", embeddings.shape[1])

collection_name = "new_RAG"
print("Checking if the collection exists...")
try:
    qdrant.get_collection(collection_name=collection_name)
    print(f"Collection '{collection_name}' already exists. Skipping creation.")
except Exception as e:
    print(f"Collection '{collection_name}' does not exist. Creating the collection...")
    try:
        qdrant.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=embeddings.shape[1], distance=Distance.COSINE)
        )
        print(f"Collection '{collection_name}' created successfully.")
    except Exception as e:
        print(f"Error creating collection: {e}")

print("Creating a list of PointStruct objects:")
points = []
for i, row in tqdm(df.iterrows(), total=df.shape[0], desc="Uploading to Qdrant"):
    points.append(
        PointStruct(
            id=i,
            vector=embeddings[i].tolist(),
            payload=row.to_dict()
        )
    )

print(f"Uploading {len(points)} points to Qdrant collection '{collection_name}'...")
try:
    qdrant.upsert(collection_name=collection_name, points=points)
except Exception as e:
    print(f"Error uploading points to Qdrant: {e}")

# -------------------------
# Step 3: Retrieve Questions from Qdrant
# -------------------------

def get_question(row):
    query, row_context = row["question"], row["context"]

    instruction = "You are an AI compliance specialist on ISO 27001 and ISO 27002 standards, specifically the 2022 editions.'.\n\n"
    
    qn = [
        {"role": "system", "content": instruction},
        {"role": "user", "content": f"Question: {query}\n\nContext: {row_context}\n\nAnswer:"},
        {"role": "assistant", "content": row["answer"]}
    ]

    return qn

# Generate question
print("Generating question for fine-tuning...")
df["qn"] = df.progress_apply(get_question, axis=1)

# -------------------------
# Step 4: Prepare JSONL File for Fine-Tuning
# -------------------------

train_df, val_df = train_test_split(df, test_size=0.2, random_state=42)

def dataframe_to_jsonl(df, output_path):
    with open(output_path, "w") as f:
        for _, row in tqdm(df.iterrows(), total=df.shape[0], desc="Preparing JSONL file"):
            jsonl_entry = {"messages": row["qn"]}
            f.write(json.dumps(jsonl_entry) + "\n")

# Save training and validation datasets
dataframe_to_jsonl(train_df, "finetune_training.jsonl")
dataframe_to_jsonl(val_df, "finetune_validation.jsonl")

print("Fine-tuning data preparation complete!")

# -------------------------
# Step 5: Upload File to OpenAI and Fine-Tune
# -------------------------

def upload_file(file_path):
    """Uploads a file to OpenAI for fine-tuning and returns the file ID."""
    try:
        upload_response = client.files.create(
            file=Path(file_path),
            purpose="fine-tune"
        )
        print(f"File '{file_path}' uploaded successfully. File ID: {upload_response.id}")
        return upload_response.id
    except Exception as e:
        print(f"Error uploading '{file_path}' to OpenAI: {e}")
        return None

# Upload training and validation files
training_file_id = upload_file("finetune_training.jsonl")
validation_file_id = upload_file("finetune_validation.jsonl")

if training_file_id and validation_file_id:
    # Fine-tune the model
    try:
        fine_tune_job = client.fine_tuning.jobs.create(
            model="gpt-4o-mini-2024-07-18",
            training_file=training_file_id,
            validation_file=validation_file_id,
            # Set the fine-tuning method and hyperparameters
            method={
                "type": "supervised",
                "supervised": {
                    "hyperparameters": {
                        "n_epochs": 4,                   # Number of training epochs
                        "batch_size": 32,                # Batch size for training
                        "learning_rate_multiplier": 0.1  # Learning rate scaling factor
                    }
                }
            }    
        )
        print(f"Fine-tuning job created. Job ID: {fine_tune_job.id}")

    # For debugging OpenAI 
    except openai.APIConnectionError as e:
        print("Error: The server could not be reached. Please check your internet connection and verify OpenAI's service status.")
        print(f"Details: {e.__cause__}")
    except openai.RateLimitError as e:
        print("Error: Too many requests were made in a short period. Please wait a moment and try again.")
        print("Suggestion: Implement retry logic with exponential backoff or request a higher rate limit if necessary.")
    except openai.APIStatusError as e:
        print(f"Error: Received an unexpected status code ({e.status_code}). This indicates an issue with the API request.")
        print("Suggestion: Check the API documentation for valid parameters and ensure your request is well-formed.")
        print(f"Response Details: {e.response}")
    except Exception as e:
        print("An unexpected error occurred.")
        print(f"Details: {str(e)}")

# -------------------------
# MODEL ID
# -------------------------

# ft:gpt-4o-mini-2024-07-18:personal::Ax6Z3JaX