import re
from typing import Dict, Any


def parse_resume_text(text: str) -> Dict[str, Any]:
    clean_text = re.sub(r'\n+', '\n', text)

    sections = {
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "raw_text": clean_text,
        "entities": {
            "organizations": [],
            "persons": []
        }
    }

    current_section = None

    lines = clean_text.split('\n')

    for line in lines:
        line_lower = line.strip().lower()

        if not line_lower:
            continue

        if line_lower in [
            "skills",
            "technical skills",
            "core competencies"
        ]:
            current_section = "skills"
            continue

        elif line_lower in [
            "experience",
            "work experience",
            "employment history",
            "professional experience"
        ]:
            current_section = "experience"
            continue

        elif line_lower in [
            "education",
            "academic background"
        ]:
            current_section = "education"
            continue

        elif line_lower in [
            "projects",
            "personal projects"
        ]:
            current_section = "projects"
            continue

        if current_section:
            sections[current_section].append(line.strip())

    return sections