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
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()
# print(os.getenv("GOOGLE_API_KEY"))

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.3,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

def generate_resume_feedback(resume_text, job_description, missing_skills):

    template = """
    You are an expert AI Resume Reviewer and Technical Recruiter.

    Job Description:
    {job_description}

    Candidate Resume:
    {resume_text}

    Missing Skills:
    {missing_skills}

    Provide:
    1. ATS Match Score
    2. Resume Strengths
    3. Weak Areas
    4. Missing Skills Analysis
    5. Personalized Suggestions
    6. Improved Resume Bullet Points
    7. Final Hiring Readiness Summary

    Be highly specific and personalized.
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

    return response