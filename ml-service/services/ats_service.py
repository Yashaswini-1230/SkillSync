from services.embedding_service import get_embedding
from services.ner_service import extract_entities
from utils.similarity import cosine_similarity
from utils.text_processing import clean_text
from utils.skill_normalizer import normalize_skills

def analyze_resume(resume_text, job_description):

    resume_text = clean_text(resume_text)
    job_description = clean_text(job_description)

    # embeddings
    resume_embedding = get_embedding(resume_text)
    jd_embedding = get_embedding(job_description)

    semantic_similarity = cosine_similarity(resume_embedding, jd_embedding)

    # skill extraction
    resume_skills = normalize_skills(extract_entities(resume_text))
    jd_skills = normalize_skills(extract_entities(job_description))

    matching_skills = list(set(resume_skills) & set(jd_skills))
    missing_skills = list(set(jd_skills) - set(resume_skills))

    skill_score = 0
    if len(jd_skills) > 0:
        skill_score = len(matching_skills) / len(jd_skills)

    # keyword density
    keyword_hits = 0
    for skill in jd_skills:
        if skill in resume_text:
            keyword_hits += 1

    keyword_score = keyword_hits / (len(jd_skills) + 1)

    # final ATS score
    ats_score = (
        semantic_similarity * 0.4 +
        skill_score * 0.4 +
        keyword_score * 0.2
    )

    ats_score = round(ats_score * 100, 2)

    return {

        "ats_score": ats_score,

        "semantic_similarity": round(semantic_similarity * 100, 2),

        "skill_score": round(skill_score * 100, 2),

        "keyword_score": round(keyword_score * 100, 2),

        "matching_skills": matching_skills,

        "missing_skills": missing_skills

    }