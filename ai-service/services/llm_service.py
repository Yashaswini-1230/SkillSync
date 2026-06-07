# import os
# from langchain_openai import ChatOpenAI
# from langchain_core.prompts import PromptTemplate
# # from langchain.chains import LLMChain
# from dotenv import load_dotenv

# load_dotenv()

# # We default to ChatOpenAI but you can switch to ChatGoogleGenerativeAI
# # if using Gemini API, or ChatAnthropic. 
# # Make sure OPENAI_API_KEY is in .env
# try:
#     llm = ChatOpenAI(temperature=0.7, model_name="gpt-4o-mini")
# except Exception as e:
#     print(f"Failed to initialize LLM: {e}")
#     llm = None

# def generate_resume_feedback(resume_text: str, job_description: str, missing_skills: list) -> str:
#     """
#     Uses LLM to generate personalized, contextual feedback.
#     """
#     if not llm:
#         return "LLM not initialized. Please check your API keys."
        
#     template = """
#     You are an expert AI Career Coach and Senior Technical Recruiter.
    
#     Job Description:
#     {job_description}
    
#     Candidate Resume:
#     {resume_text}
    
#     Missing Skills Identified:
#     {missing_skills}
    
#     Provide a professional, highly personalized evaluation of the candidate's resume for this specific job.
#     Do NOT give generic advice. Reference their actual projects and experience.
#     Point out exactly where they lack requirements and suggest specific bullet-point rewrites.
#     """
    
#     prompt = PromptTemplate(
#         input_variables=["job_description", "resume_text", "missing_skills"],
#         template=template
#     )
    
#     chain = prompt | llm
    
#     response = chain.invoke({
#         "job_description": job_description,
#         "resume_text": resume_text,
#         "missing_skills": ", ".join(missing_skills)
#     })
    
#     return response.content
import os
import json
from dotenv import load_dotenv

load_dotenv()

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.prompts import PromptTemplate
    from langchain_core.output_parsers import StrOutputParser

    google_api_key = os.getenv("GOOGLE_API_KEY")
    llm = (
        ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.3,
            google_api_key=google_api_key
        )
        if google_api_key
        else None
    )
except Exception as e:
    print(f"LLM feedback disabled: {e}")
    ChatGoogleGenerativeAI = None
    PromptTemplate = None
    StrOutputParser = None
    llm = None

def generate_resume_feedback(resume_text, job_description, missing_skills):
    if not llm:
        return {
            "keyword_optimization_score": 0,
            "formatting_score": 0,
            "experience_relevance_score": 0,
            "project_relevance_score": 0,
            "leadership_score": 0,
            "impact_score": 0,
            "rewritten_bullets": [],
            "feedback_summary": "LLM feedback is disabled. Configure GOOGLE_API_KEY to enable personalized feedback.",
            "strengths": [],
            "weaknesses": ["Personalized AI feedback is not configured"]
        }

    template = """
    You are an expert AI Resume Reviewer and Technical Recruiter.

    Job Description:
    {job_description}

    Candidate Resume:
    {resume_text}

    Missing Skills:
    {missing_skills}

    Provide a highly specific and personalized evaluation.
    Return your response EXCLUSIVELY as a valid JSON object with the following exact keys. Do NOT include Markdown backticks around the JSON. Do not include any other text.
    {{
        "keyword_optimization_score": 85,
        "formatting_score": 90,
        "experience_relevance_score": 80,
        "project_relevance_score": 75,
        "leadership_score": 60,
        "impact_score": 70,
        "rewritten_bullets": [
            {{
                "original": "Did some coding",
                "improved": "Developed scalable microservices using Node.js, improving system performance by 30%",
                "reason": "Quantifies impact and specifies technologies used"
            }}
        ],
        "feedback_summary": "Overall good resume but lacks quantifiable metrics in the experience section.",
        "strengths": ["Strong technical skills", "Relevant degree"],
        "weaknesses": ["Missing ATS keywords", "Formatting is inconsistent"]
    }}
    Make sure to provide 3-5 rewritten bullets based on weak points in their resume. Score them honestly out of 100 based on ATS standards.
    """

    prompt = PromptTemplate(
        input_variables=[
            "job_description",
            "resume_text",
            "missing_skills"
        ],
        template=template
    )

    parser = StrOutputParser()

    chain = prompt | llm | parser

    response = chain.invoke({
        "job_description": job_description,
        "resume_text": resume_text,
        "missing_skills": ", ".join(missing_skills)
    })

    try:
        # Clean response in case LLM added markdown backticks
        clean_response = response.strip()
        if clean_response.startswith("```json"):
            clean_response = clean_response[7:-3]
        elif clean_response.startswith("```"):
            clean_response = clean_response[3:-3]
        return json.loads(clean_response)
    except Exception as e:
        print(f"JSON Parse Error: {e}")
        return {
            "keyword_optimization_score": 50,
            "formatting_score": 50,
            "experience_relevance_score": 50,
            "project_relevance_score": 50,
            "leadership_score": 50,
            "impact_score": 50,
            "rewritten_bullets": [],
            "feedback_summary": response,
            "strengths": [],
            "weaknesses": []
        }
