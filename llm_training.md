# LLM Training Documentation

## Training Data Preparation

Refer to ISO_QAS_v6.json, finetune_training.jsonl & finetune_validation.jsonl

## Model Training Process

Refer to LLM training.py

Step 1: Load the dataset ISO_QAS_v6.json, which contains questions and answers on ISO 27001 & ISO 27002 in the SQuAD format.

Step 2: Create a Qdrant collection and store the embeddings of the questions and answers for efficient retrieval.

Step 3: Retrieve the stored questions from Qdrant and convert them into OpenAI’s fine-tuning format (.jsonl).

Step 4: Split the dataset into 80% training and 20% validation, ensuring proper formatting for fine-tuning.

Step 5: Upload the JSONL file to OpenAI and initiate the fine-tuning process.

## Evaluation Metrics

Refer to fine_tuned_results.xlsx & finetune_result.png

## Sample Outputs

Example query: "What is ISO?"

Response: "ISO stands for the International Organization for Standardization. It is an independent, non-governmental international organization that develops and publishes a wide range of proprietary, industrial, and commercial standards. The purpose of ISO is to ensure quality, safety, efficiency, and interoperability of products, services, and systems across different sectors globally. ISO standards are developed through a collaborative process involving expert committees from various industries and sectors. Each standard is assigned a unique number and title, and they cover various fields, including quality management, environmental management, information security, and more. In the context of information security, ISO 27001 focuses on the requirements for an Information Security Management System (ISMS), while ISO 27002 provides guidelines for establishing, implementing, maintaining, and continually improving information security management. Together, they support organizations in managing and mitigating risks to their information assets." 
