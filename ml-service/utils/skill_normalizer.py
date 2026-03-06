SKILL_MAP = {
    "react.js": "react",
    "node": "node.js",
    "nodejs": "node.js",
    "mongo": "mongodb",
    "mongo db": "mongodb",
    "js": "javascript",
    "py": "python",
    "ml": "machine learning",
    "ai": "artificial intelligence"
}

def normalize_skills(skills):

    normalized = []

    for skill in skills:
        skill = skill.lower().strip()

        if skill in SKILL_MAP:
            normalized.append(SKILL_MAP[skill])
        else:
            normalized.append(skill)

    return list(set(normalized))