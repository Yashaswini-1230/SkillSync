from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from services.interview_service import get_next_question, evaluate_single_answer

router = APIRouter()

class InterviewSetupRequest(BaseModel):
    resume_context: str
    target_role: str
    history: List[Dict[str, str]] = [] # list of {"role": "user"/"ai", "content": "..."}

class AnswerEvaluationRequest(BaseModel):
    question: str
    answer: str
    context: str

@router.post("/generate-questions")
async def generate_questions(request: InterviewSetupRequest):
    """
    Generates personalized interview questions based on candidate resume and role.
    """
    try:
        next_q = get_next_question(request.resume_context, request.target_role, request.history)
        return {
            "question": next_q
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate-answer")
async def evaluate_answer(request: AnswerEvaluationRequest):
    """
    Evaluates candidate's answer to an interview question.
    """
    try:
        result = evaluate_single_answer(request.question, request.answer, request.context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
