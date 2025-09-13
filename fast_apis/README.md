# CV Resume Flow Service

A FastAPI-based service that combines the structure of CV Review Module with the logic of ResumeFlow. It provides two endpoints to extract CV data and job details using LlamaParse and Azure OpenAI.

## Features
- **Extract CV**: Process PDF or DOCX CV files and extract structured data using ResumeFlow's schema.
- **Extract Job Details**: Extract job details from text input using ResumeFlow's schema.

## Installation
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd cv_resume_flow


Install dependencies:pip install -r requirements.txt


Set up environment variables in .env:api_key=your_azure_openai_api_key
azure_endpoint=your_azure_endpoint
api_version=your_api_version
deployment_name=your_deployment_name
model_name=gpt-4o
LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key


Run the application:python main.py



Usage

Extract CV:
curl -X POST -F "file=@cv.pdf" http://localhost:8001/resume-flow/extract-cv/

Returns JSON data based on ResumeFlow's ResumeSchema.

Extract Job Details:
curl -X POST -H "Content-Type: application/json" -d '{"job_description": "Software Engineer at XYZ Corp..."}' http://localhost:8001/resume-flow/extract-job/

Returns JSON data based on ResumeFlow's JobDetails.


Project Structure

src/engines/: Azure OpenAI integration.
src/prompts/: Prompts for CV and job detail extraction.
src/routers/: FastAPI endpoints.
src/schemas/: Pydantic schemas for CV and job data.
src/services/: Business logic for extraction.
src/utils/: Text processing utilities.
temp/: Temporary file storage.


