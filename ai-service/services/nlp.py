from sentence_transformers import SentenceTransformer, util
import os

# Initialize model globally so it stays in memory
MODEL_NAME = "all-mpnet-base-v2"
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
    A basic function to extract skills from JD to compare against resume.
    In a real app, this might use LLM or an exhaustive ontology.
    """
    # Placeholder
    return ["React", "Node.js", "Python", "MongoDB", "AWS"]

def extract_missing_skills(resume_skills: list, jd_skills: list) -> list:
    """
    Identifies which skills from the JD are missing in the resume.
    """
    # Simple set difference
    # In reality, needs synonym resolution (e.g., JS == JavaScript)
    res_set = {s.lower() for s in resume_skills}
    missing = [skill for skill in jd_skills if skill.lower() not in res_set]
    return missing
