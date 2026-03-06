from transformers import pipeline
from config import NER_MODEL

ner_model = pipeline("ner", model=NER_MODEL, aggregation_strategy="simple")

def extract_entities(text: str):

    entities = ner_model(text)

    skills = []

    for ent in entities:
        word = ent["word"].lower()

        if len(word) > 2:
            skills.append(word)

    return list(set(skills))