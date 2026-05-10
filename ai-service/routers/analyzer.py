from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from typing import List
from services.nlp import compute_similarity, extract_skills_from_jd, extract_missing_skills
from services.llm_service import generate_resume_feedback
from services.parser import parse_resume_text

router = APIRouter()

class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str

@router.post("/score")
async def analyze_and_score(request: AnalyzeRequest):
    """
    Computes semantic similarity and ATS score based on resume and JD.
    """
    try:
        # 1. Semantic Similarity
        sim_score = compute_similarity(request.resume_text, request.job_description)
        match_percentage = round(sim_score * 100, 2)
        
        # 2. Extract Skills
        jd_skills = extract_skills_from_jd(request.job_description)
        parsed_resume = parse_resume_text(request.resume_text)
        # Using simple word matching for now as placeholder for resume skills
        resume_skills = parsed_resume.get('skills', []) 
        
        missing = extract_missing_skills(resume_skills, jd_skills)
        
        # 3. Generate Feedback
        feedback = generate_resume_feedback(request.resume_text, request.job_description, missing)
        
        # 4. ATS Score Calculation (simplified)
        # 40% semantic, 60% skills
        skill_score = 0 if not jd_skills else ((len(jd_skills) - len(missing)) / len(jd_skills)) * 100
        ats_score = round((match_percentage * 0.4) + (skill_score * 0.6))
        
        return {
            "ats_score": ats_score,
            "semantic_match_percentage": match_percentage,
            "missing_skills": missing,
            "strengths": [s for s in jd_skills if s not in missing],
            "feedback": feedback
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
