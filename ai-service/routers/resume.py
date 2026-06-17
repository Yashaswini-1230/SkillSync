from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any
import os
import shutil
import tempfile
import zipfile
import xml.etree.ElementTree as ET
import fitz
from services.parser import parse_resume_text

router = APIRouter()

@router.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    """
    Parses a PDF/DOCX resume and extracts structured data (Skills, Experience, Education)
    """
    if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Invalid file format. Only PDF and DOCX are supported.")
    
    suffix = os.path.splitext(file.filename or "")[1]
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_file_path = temp_file.name
        
    with temp_file as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        if file.content_type == "application/pdf":
            raw_text = extract_text_from_pdf(temp_file_path)
        else:
            raw_text = extract_text_from_docx(temp_file_path)
            
        parsed_data = parse_resume_text(raw_text)
        
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    return {
        "filename": file.filename,
        "text": raw_text,
        "parsed_data": parsed_data
    }


def extract_text_from_pdf(file_path: str) -> str:
    text = []
    with fitz.open(file_path) as document:
        for page in document:
            text.append(page.get_text())
    return "\n".join(text).strip()


def extract_text_from_docx(file_path: str) -> str:
    with zipfile.ZipFile(file_path) as docx:
        xml_content = docx.read("word/document.xml")

    root = ET.fromstring(xml_content)
    namespace = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    paragraphs = []

    for paragraph in root.findall(".//w:p", namespace):
        runs = [
            node.text
            for node in paragraph.findall(".//w:t", namespace)
            if node.text
        ]
        if runs:
            paragraphs.append("".join(runs))

    return "\n".join(paragraphs).strip()
