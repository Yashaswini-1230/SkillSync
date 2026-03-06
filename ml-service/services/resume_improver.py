from transformers import pipeline

generator = pipeline(
    "text-generation",
    model="google/flan-t5-base"
)

def improve_resume_bullet(bullet, job_role):

    prompt = f"""
Rewrite the following resume bullet for a {job_role} role.
Use strong action verbs and include measurable achievements.

Bullet:
{bullet}

Improved version:
"""

    result = generator(
        prompt,
        max_length=120,
        do_sample=True,
        temperature=0.7
    )

    return result[0]["generated_text"]