import fitz  # PyMuPDF
import spacy
import re
from typing import Dict, Any

# Note: In production, you would run `python -m spacy download en_core_web_sm`
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("spaCy model en_core_web_sm not found. Using blank English pipeline.")
    nlp = spacy.blank("en")

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts raw text from a PDF file using PyMuPDF."""
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def parse_resume_text(text: str) -> Dict[str, Any]:
    """
    Parses the raw text of a resume into structured sections.
    """
    # Clean text
    clean_text = re.sub(r'\n+', '\n', text)
    
    # Very basic section segmentation based on common headers
    # A robust implementation would use ML/CRF for section classification
    sections = {
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "raw_text": clean_text
    }
    
    current_section = None
    
    lines = clean_text.split('\n')
    for line in lines:
        line_lower = line.strip().lower()
        if not line_lower:
            continue
            
        if line_lower in ["skills", "technical skills", "core competencies"]:
            current_section = "skills"
            continue
        elif line_lower in ["experience", "work experience", "employment history", "professional experience"]:
            current_section = "experience"
            continue
        elif line_lower in ["education", "academic background"]:
            current_section = "education"
            continue
        elif line_lower in ["projects", "personal projects"]:
            current_section = "projects"
            continue
            
        if current_section:
            sections[current_section].append(line.strip())
            
    # Use spaCy for basic NER (e.g., finding organizations, dates, degrees)
    doc = nlp(clean_text)
    organizations = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
    
    sections['entities'] = {
        'organizations': list(set(organizations))
    }
    
    return sections
