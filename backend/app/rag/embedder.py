"""Embedding provider abstraction for RAG.
Supports Google Gemini embeddings with automatic fallback to high-performance local deterministic embeddings.
"""
import os
import math
import hashlib
import re
from typing import List, Protocol
import numpy as np

class BaseEmbedder(Protocol):
    def embed_text(self, text: str) -> List[float]:
        ...
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        ...

class DeterministicNgramEmbedder:
    """High-speed local dense embedding using hashing and term-frequency normalization.
    Yields normalized 512-dimension embeddings for instant, deterministic retrieval without API quotas.
    """
    def __init__(self, dim: int = 512):
        self.dim = dim

    def embed_text(self, text: str) -> List[float]:
        vec = np.zeros(self.dim, dtype=np.float32)
        tokens = re.findall(r'\b[a-zA-Z0-9_\-\.]{2,}\b', text.lower())
        if not tokens:
            return vec.tolist()
            
        # Unigrams and bigrams
        terms = list(tokens)
        for i in range(len(tokens) - 1):
            terms.append(f"{tokens[i]}_{tokens[i+1]}")
            
        for term in terms:
            # Deterministic MD5 hash to bucket
            h = int(hashlib.md5(term.encode('utf-8')).hexdigest(), 16)
            idx = h % self.dim
            sign = 1.0 if ((h >> 8) & 1) == 0 else -1.0
            vec[idx] += sign

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]

class GeminiEmbedder:
    """Embeddings using Google GenAI SDK (text-embedding-004)."""
    def __init__(self, api_key: str, model: str = "text-embedding-004"):
        self.api_key = api_key
        self.model = model
        self.fallback = DeterministicNgramEmbedder()
        self._client = None
        try:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
        except Exception:
            pass

    def embed_text(self, text: str) -> List[float]:
        if not self._client:
            return self.fallback.embed_text(text)
        try:
            response = self._client.models.embed_content(
                model=self.model,
                contents=text
            )
            return response.embeddings[0].values
        except Exception:
            return self.fallback.embed_text(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]

def get_embedder() -> BaseEmbedder:
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        return GeminiEmbedder(api_key=gemini_key)
    return DeterministicNgramEmbedder()
