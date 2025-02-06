# System Architecture Documentation

## System Overview
The system architecture is designed to ensure seamless integration between the backend, frontend, and AI components, with a focus on scalability and modularity. The architecture comprises the following components: 

## Components
Frontend: 

Built using HTML, CSS, and JavaScript to provide a clean, user-friendly interface. 

Enables users to upload documents, view compliance reports, and interact with the AI-powered copilot. 

Backend: 

Developed using Python (Flask framework) to handle API requests and serve as the core processing engine. 

AI Model: 

Fine-tuned OpenAI GPT-4o Mini model trained on questions and answers regarding the ISO 27001 and ISO 27002 compliance standards. 

Supports retrieval-augmented generation (RAG) for evidence classification and compliance validation. 

Database: 

MySQL for structured data storage and retrieval. 

Plans to integrate a vector database (e.g., Pinecone, Qdrant) for efficient retrieval of embedded compliance policies. 

Hosting: 

The application is hosted locally and made accessible via ngrok for secure external access. 

File Handling and OCR: 

Supports document uploads in multiple formats (DOCX, PDF, CSV, Excel). 

OCR functionality for text extraction from scanned documents (under debugging). 

## Data Flow
User → Frontend UI → API Layer: Users send requests through the UI, which are routed via the API layer to the backend.

API Layer ↔ Database: API accesses the database for user data, scan results, and compliance standards.

Network Scanning Module ↔ Compliance Module: Scan results are sent for verification, and the compliance module checks against stored benchmarks.

Compliance Module → Alerting Module: Non-compliance triggers alerts sent to the user.

LLM Integration ↔ Compliance Module: The LLM uses policies to analyze data and provide suggestions.

Report Generation Module → Frontend UI: Completed reports are available for user download.
