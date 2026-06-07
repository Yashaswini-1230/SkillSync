from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.nlp import analyze_skill_match, compute_similarity
from services.llm_service import generate_resume_feedback

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
        sim_score = compute_similarity(request.resume_text, request.job_description)
        match_percentage = round(sim_score * 100, 2)

        skill_match = analyze_skill_match(request.resume_text, request.job_description)
        missing = skill_match["missing_skills"]
        matching = skill_match["matching_skills"]
        skill_score = skill_match["skill_score"]

        feedback_data = generate_resume_feedback(request.resume_text, request.job_description, missing)

        keyword_score = skill_score
        ats_score = round((match_percentage * 0.4) + (skill_score * 0.5) + (keyword_score * 0.1), 2)
        
        return {
            "ats_score": ats_score,
            "semantic_similarity": match_percentage,
            "semantic_match_percentage": match_percentage,
            "skill_score": skill_score,
            "keyword_score": keyword_score,
            "matching_skills": matching,
            "missing_skills": missing,
            "resume_skills": skill_match["resume_skills"],
            "job_skills": skill_match["job_skills"],
            "strengths": feedback_data.get("strengths", matching),
            "feedback": feedback_data.get("feedback_summary", ""),
            "keyword_optimization_score": feedback_data.get("keyword_optimization_score", 0),
            "formatting_score": feedback_data.get("formatting_score", 0),
            "experience_relevance_score": feedback_data.get("experience_relevance_score", 0),
            "project_relevance_score": feedback_data.get("project_relevance_score", 0),
            "leadership_score": feedback_data.get("leadership_score", 0),
            "impact_score": feedback_data.get("impact_score", 0),
            "rewritten_bullets": feedback_data.get("rewritten_bullets", []),
            "weaknesses": feedback_data.get("weaknesses", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
