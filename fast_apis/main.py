import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import status, Request

from src.routers import resume_router

app = FastAPI(
    title="CV Resume Flow Service",
    description="Service for extracting CV and job details using ResumeFlow logic and CV Review Module structure",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    exc_str = f'{exc}'.replace('\n', ' ').replace('   ', ' ')
    print(exc_str)
    content = {'status_code': 422, 'detail': exc_str, 'headers': None}
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=content)

app.include_router(resume_router)

@app.get("/")
async def root():
    return {"message": "CV Resume Flow Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        workers=1,
        reload=True
    )
