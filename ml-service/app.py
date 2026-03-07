# from fastapi import FastAPI
# from pydantic import BaseModel
# from routes.analyze import analyze_router

# from services.embedding_service import get_embedding
# from services.ner_service import extract_entities
# from services.ats_service import analyze_resume
# from services.resume_improver import improve_resume_bullet
# app = FastAPI(title="SkillSync AI Service")


# # Request models
# class ResumeInput(BaseModel):
#     resume_text: str
#     job_description: str


# class TextInput(BaseModel):
#     text: str

# class BulletInput(BaseModel):
#     bullet: str
#     job_role: str


# @app.post("/improve-bullet")
# def improve_bullet(data: BulletInput):

#     improved = improve_resume_bullet(data.bullet, data.job_role)

#     return {"improved_bullet": improved}


# @app.get("/")
# def home():
#     return {"message": "SkillSync AI Service Running"}


# # Embedding endpoint
# @app.post("/embed")
# def embed(data: TextInput):
#     embedding = get_embedding(data.text)
#     return {"embedding": embedding}


# # NER endpoint
# @app.post("/ner")
# def ner(data: TextInput):
#     entities = extract_entities(data.text)
#     return {"entities": entities}


# # Resume analysis endpoint
# @app.post("/analyze")
# def analyze(data: ResumeInput):
#     result = analyze_resume(data.resume_text, data.job_description)
#     return result

from fastapi import FastAPI
from pydantic import BaseModel

from services.embedding_service import get_embedding
from services.ner_service import extract_entities
from services.ats_service import analyze_resume
from services.resume_improver import improve_resume_bullet

app = FastAPI(title="SkillSync AI Service")


# ==============================
# Request Models
# ==============================

class ResumeInput(BaseModel):
    resume_text: str
    job_description: str


class TextInput(BaseModel):
    text: str


class BulletInput(BaseModel):
    bullet: str
    job_role: str


# ==============================
# Startup Event
# ==============================

@app.on_event("startup")
def startup_event():
    print("SkillSync AI Service Started")


# ==============================
# Home
# ==============================

@app.get("/")
def home():
    return {"message": "SkillSync AI Service Running"}


# ==============================
# Embedding Endpoint
# ==============================

@app.post("/embed")
def embed(data: TextInput):
    embedding = get_embedding(data.text)
    return {"embedding": embedding}


# ==============================
# NER Endpoint
# ==============================

@app.post("/ner")
def ner(data: TextInput):
    entities = extract_entities(data.text)
    return {"entities": entities}


# ==============================
# Resume ATS Analysis
# ==============================

@app.post("/analyze")
def analyze(data: ResumeInput):
    result = analyze_resume(
        data.resume_text,
        data.job_description
    )

    return result


# ==============================
# Resume Bullet Improver
# ==============================

@app.post("/improve-bullet")
def improve_bullet(data: BulletInput):

    improved = improve_resume_bullet(
        data.bullet,
        data.job_role
    )

    return {"improved_bullet": improved}