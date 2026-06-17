from sentence_transformers import SentenceTransformer, util
from services.skill_extractor import compare_skills, extract_skills

# Initialize model globally so it stays in memory
MODEL_NAME = "all-MiniLM-L6-v2"
try:
    print(f"Loading SentenceTransformer model: {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

def compute_similarity(resume_text: str, job_description: str) -> float:
    """
    Computes semantic similarity score between resume and job description.
    """
    if not model:
        return 0.0
        
    embeddings1 = model.encode(resume_text, convert_to_tensor=True)
    embeddings2 = model.encode(job_description, convert_to_tensor=True)
    
    # Compute cosine similarity
    cosine_scores = util.cos_sim(embeddings1, embeddings2)
    score = cosine_scores[0][0].item()
    
    return max(0.0, score) # return positive float

def extract_skills_from_jd(job_description: str) -> list:
    """
    Extracts job skills with the production skill matcher.
    """
    return extract_skills(job_description)

def extract_missing_skills(resume_skills: list, jd_skills: list) -> list:
    """
    Identifies which skills from the JD are missing in the resume.
    """
    res_set = {s.lower() for s in resume_skills}
    missing = [skill for skill in jd_skills if skill.lower() not in res_set]
    return missing

def analyze_skill_match(resume_text: str, job_description: str) -> dict:
    return compare_skills(resume_text, job_description)
