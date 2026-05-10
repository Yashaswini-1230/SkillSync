from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume, interview, analyzer
import uvicorn
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="SkillSync AI Service",
    description="AI Engine for Resume Analysis and Mock Interviews",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Node.js backend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(analyzer.router, prefix="/api/analyzer", tags=["Analyzer"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])

@app.get("/")
def read_root():
    return {"status": "ok", "message": "SkillSync AI Service is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
