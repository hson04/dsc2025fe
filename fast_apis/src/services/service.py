from src.engines.llm_engine import LLMEngine
from src.services.resume_service import ResumeService

from src.prompts.prompt_resume_flow import RESUME_WRITER_PERSONA

class Service:
    def __init__(self):
        self.llm_engine = LLMEngine(system_prompt=RESUME_WRITER_PERSONA)
        self.resume_service = ResumeService()