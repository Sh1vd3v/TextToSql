from pathlib import Path
from sentence_transformers import SentenceTransformer
import numpy as np


def save_to_file(data, path):
    output_path = Path(path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", encoding="utf-8") as file:
        file.write(data)

def save_dense_vectors(data, path):

    file_path = Path(path)

    file_path.parent.mkdir(parents=True, exist_ok=True)

    np.save(file_path, data)



def embed_schema():
    file_path = Path ("./assets/knowledgeBase.txt");
    
    with open(file_path, "r") as file:
        content = file.read()

    documents = [
        line.strip()
        for line in content.split("#")
        if line.strip()
    ]

    model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")

    vectors = model.encode(documents, normalize_embeddings=True)

    save_dense_vectors(vectors, "./assets/dense_vectors.npy")

    print(vectors)
    print("Shape:", vectors.shape)
    print("Data type:", vectors.dtype)
    print("Dimensions per document:", vectors.shape[1])

    print("All finite:", np.isfinite(vectors).all())

    query = "Find the titles of books and their authors"

    query_vector = model.encode(
        query,
        normalize_embeddings=True
    )
    scores = vectors @ query_vector
  
    for i in np.argsort(scores)[::-1][:3]:
      print(f"Score: {scores[i]:.4f}")
      print(documents[i])
      print()

    load_vectors()

def load_vectors():
    file_path = Path ("./assets/dense_vectors.npy")

    if not file_path.exists():
        print("Vectors not present")
        return


    vectors = np.load(file_path)

    print(vectors)


    
    