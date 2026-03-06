import numpy as np

def cosine_similarity(vec1, vec2):

    v1 = np.array(vec1)
    v2 = np.array(vec2)

    dot = np.dot(v1, v2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)

    if norm1 == 0 or norm2 == 0:
        return 0

    return float(dot / (norm1 * norm2))