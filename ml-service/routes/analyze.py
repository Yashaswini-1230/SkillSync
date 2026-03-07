from fastapi import APIRouter
from services.ats_service import analyze_resume

router = APIRouter()

@router.post("/analyze")
def analyze(data: dict):

    resume = data["resume_text"]
    jd = data["job_description"]

    result = analyze_resume(resume, jd)

    return result