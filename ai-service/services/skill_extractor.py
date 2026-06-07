import re
from typing import Iterable, List, Set

SKILL_SYNONYMS = {
    "amazon web services": "aws",
    "aws cloud": "aws",
    "css3": "css",
    "express": "express.js",
    "express js": "express.js",
    "js": "javascript",
    "mongo db": "mongodb",
    "node": "node.js",
    "nodejs": "node.js",
    "react js": "react",
    "react.js": "react",
    "tailwind": "tailwind css",
    "ts": "typescript",
}

CANONICAL_SKILLS = {
    ".net",
    "agile",
    "ai",
    "android",
    "angular",
    "api",
    "aws",
    "azure",
    "bootstrap",
    "c",
    "c++",
    "c#",
    "ci/cd",
    "css",
    "data analysis",
    "data science",
    "deep learning",
    "django",
    "docker",
    "express.js",
    "fastapi",
    "figma",
    "firebase",
    "flask",
    "git",
    "github",
    "go",
    "graphql",
    "html",
    "java",
    "javascript",
    "jenkins",
    "jira",
    "jquery",
    "kubernetes",
    "langchain",
    "linux",
    "machine learning",
    "mongodb",
    "mysql",
    "next.js",
    "nlp",
    "node.js",
    "nosql",
    "numpy",
    "pandas",
    "postgresql",
    "power bi",
    "python",
    "pytorch",
    "react",
    "redis",
    "rest api",
    "scikit-learn",
    "selenium",
    "sql",
    "sqlite",
    "tailwind css",
    "tensorflow",
    "typescript",
    "vue",
}

SKILL_ALIASES = CANONICAL_SKILLS | set(SKILL_SYNONYMS.keys())


def normalize_skill(skill: str) -> str:
    normalized = re.sub(r"\s+", " ", skill.lower().strip())
    normalized = normalized.strip(".,:;()[]{}")
    return SKILL_SYNONYMS.get(normalized, normalized)


def normalize_skills(skills: Iterable[str]) -> List[str]:
    seen: Set[str] = set()
    normalized = []

    for skill in skills:
        clean_skill = normalize_skill(skill)
        if clean_skill and clean_skill not in seen:
            normalized.append(clean_skill)
            seen.add(clean_skill)

    return sorted(normalized)


def extract_skills(text: str) -> List[str]:
    if not text:
        return []

    normalized_text = re.sub(r"\s+", " ", text.lower())
    matches = []

    for skill in sorted(SKILL_ALIASES, key=len, reverse=True):
        escaped = re.escape(skill.lower())
        pattern = rf"(?<![\w+#.]){escaped}(?![\w+#.])"
        if re.search(pattern, normalized_text):
            matches.append(skill)

    return normalize_skills(matches)


def compare_skills(resume_text: str, job_description: str) -> dict:
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_skills(job_description)

    resume_set = set(resume_skills)
    jd_set = set(jd_skills)

    matching = sorted(resume_set & jd_set)
    missing = sorted(jd_set - resume_set)
    skill_score = 0 if not jd_skills else round((len(matching) / len(jd_skills)) * 100, 2)

    return {
        "resume_skills": resume_skills,
        "job_skills": jd_skills,
        "matching_skills": matching,
        "missing_skills": missing,
        "skill_score": skill_score,
    }
