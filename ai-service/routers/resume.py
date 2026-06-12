from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any
import os
import shutil
from services.parser import  parse_resume_text

router = APIRouter()

@router.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    """
    Parses a PDF/DOCX resume and extracts structured data (Skills, Experience, Education)
    """
    if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Invalid file format. Only PDF and DOCX are supported.")
    
    # Save file temporarily
    temp_file_path = f"/tmp/{file.filename}"
    if os.name == 'nt':
        temp_file_path = f"{file.filename}"
        
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        if file.content_type == "application/pdf":
            raw_text = extract_text_from_pdf(temp_file_path)
        else:
            # Placeholder for DOCX
            raw_text = "DOCX parsing pending"
            
        parsed_data = parse_resume_text(raw_text)
        
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    return {
        "filename": file.filename,
        "parsed_data": parsed_data
    }
