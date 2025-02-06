from openai import OpenAI
import base64
import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
ftjob_id = "ftjob-yRg08RFneXr2KZIZD4ri8M9b"

fine_tune_results = client.fine_tuning.jobs.retrieve(ftjob_id).result_files
result_file_id = client.files.retrieve(fine_tune_results[0]).id

result_file = client.files.content(file_id=result_file_id)
decoded_content = base64.b64decode(result_file.read()).decode("utf-8")

from io import StringIO
csv_data = StringIO(decoded_content)
df = pd.read_csv(csv_data)
print(df)

output_excel_file = 'fine_tuned_results.xlsx'
df.to_excel(output_excel_file, index=False)
print(f"Results saved to {output_excel_file}")