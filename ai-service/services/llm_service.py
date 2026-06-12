# python
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

# ===============================
# Initialize Groq LLM
# ===============================

try:
    from langchain_groq import ChatGroq

    groq_api_key = os.getenv("GROQ_API_KEY")

    llm = (
        ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0.2,
            groq_api_key=groq_api_key
        )
        if groq_api_key
        else None
    )

    print("GROQ API FOUND:", bool(groq_api_key))

    if groq_api_key:
        print("KEY PREFIX:", groq_api_key[:10])

except Exception as e:
    print("Groq initialization error:", e)
    llm = None


# ===============================
# Default fallback response
# ===============================

def get_default_response(message="LLM generation failed."):

    return {
        "overall_ats_score": 0,

        "contact_information": {},

        "hard_skills": {},

        "soft_skills": {},

        "job_title_match": {},

        "education_match": {},

        "experience_match": {},

        "searchability": {},

        "resume_tone": {},

        "measurable_results": {},

        "web_presence": {},

        "strengths": [],

        "weaknesses": [],

        "recruiter_tips": [],

        "rewritten_bullets": [],

        "feedback_summary": message
    }


# ===============================
# Main Feedback Generator
# ===============================

def generate_resume_feedback(
    resume_text,
    job_description,
    missing_skills
):

    if not llm:
        return get_default_response(
            "Groq API Key not configured."
        )

    prompt = f"""
You are a Senior ATS Resume Reviewer and Technical Recruiter.

Your task is to evaluate this resume exactly like Jobscan ATS.

Be strict, realistic, and professional.

Analyze the following:

1. Overall ATS Score (0–100)
2. Contact Information Quality
3. Hard Skills Match
4. Soft Skills Match
5. Job Title Match
6. Education Match
7. Experience Match
8. Resume Searchability
9. Resume Tone
10. Measurable Results and Metrics
11. Web Presence (LinkedIn, GitHub, Portfolio)
12. Strengths
13. Weaknesses
14. Recruiter Tips
15. Rewrite weak resume bullets professionally.

JOB DESCRIPTION:
{job_description}

RESUME:
{resume_text}

MISSING SKILLS:
{", ".join(missing_skills)}

Return ONLY VALID JSON.

JSON FORMAT:

{{
    "overall_ats_score": 85,

    "contact_information": {{
        "score": 90,
        "issues": [],
        "recommendations": []
    }},

    "hard_skills": {{
        "matched": [],
        "missing": [],
        "score": 80
    }},

    "soft_skills": {{
        "matched": [],
        "missing": [],
        "score": 75
    }},

    "job_title_match": {{
        "score": 80,
        "feedback": ""
    }},

    "education_match": {{
        "score": 85,
        "feedback": ""
    }},

    "experience_match": {{
        "score": 75,
        "feedback": ""
    }},

    "searchability": {{
        "score": 80,
        "issues": []
    }},

    "resume_tone": {{
        "score": 80,
        "feedback": ""
    }},

    "measurable_results": {{
        "score": 70,
        "missing_metrics": true,
        "feedback": ""
    }},

    "web_presence": {{
        "linkedin": true,
        "github": true,
        "portfolio": false
    }},

    "strengths": [],

    "weaknesses": [],

    "recruiter_tips": [],

    "rewritten_bullets": [
        {{
            "original": "",
            "improved": "",
            "reason": ""
        }}
    ],

    "feedback_summary": ""
}}

IMPORTANT RULES:
- Return JSON ONLY.
- Do NOT use markdown.
- Do NOT wrap JSON inside ```json blocks.
- Give realistic ATS scores.
- Provide at least 3 strengths.
- Provide at least 3 weaknesses.
- Provide at least 3 recruiter tips.
- Provide 3 rewritten bullets.
"""

    try:

        response = llm.invoke(prompt)

        content = response.content.strip()

        print("\n========== RAW LLM RESPONSE ==========")
        print(content)
        print("======================================\n")

        # Remove markdown wrappers if present
        content = re.sub(
            r"^```json",
            "",
            content,
            flags=re.IGNORECASE
        )

        content = re.sub(
            r"```$",
            "",
            content
        )

        content = content.strip()

        feedback = json.loads(content)

        print(
            "LLM JSON parsed successfully."
        )

        return feedback

    except json.JSONDecodeError as e:

        print(
            "JSON PARSE ERROR:",
            e
        )

        print(
            "Invalid JSON received:"
        )

        print(content)

        return get_default_response(
            f"Invalid JSON returned by LLM: {str(e)}"
        )

    except Exception as e:

        print(
            "LLM ERROR:",
            e
        )

        return get_default_response(
            f"LLM generation failed: {str(e)}"
        )

