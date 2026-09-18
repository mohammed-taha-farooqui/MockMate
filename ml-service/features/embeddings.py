"""
embeddings.py
=============
Feature 4B – Sentence Transformer Semantic Similarity

PURPOSE
-------
Provides two reusable, pure-Python functions:

    generate_embedding(text)  ->  np.ndarray
        Encode a text string into a dense embedding vector using a
        pretrained Sentence Transformer model.

    cosine_similarity(text_a, text_b)  ->  float
        Return the cosine similarity in [-1, 1] between two text strings.
        Returns 0.0 for empty / invalid inputs (safe fallback).

DESIGN DECISIONS
----------------
* The SentenceTransformer model is loaded ONCE at module-import time into a
  module-level singleton (_MODEL).  Repeated calls to generate_embedding()
  and cosine_similarity() reuse the same in-memory model object – no
  reload overhead.

* Model: all-MiniLM-L6-v2
    - 22 M parameters, 80 MB download (first run only, cached by HuggingFace)
    - 384-dimensional embeddings
    - Fast on CPU; strong semantic similarity performance

* No FastAPI / Express / routes – this is a pure library module.
* No training, no fine-tuning, no Logistic Regression.
"""

from __future__ import annotations

import logging
from typing import Optional

import numpy as np
from sentence_transformers import SentenceTransformer

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model configuration
# ---------------------------------------------------------------------------

#: HuggingFace model identifier.  Change here to swap models globally.
MODEL_NAME: str = "all-MiniLM-L6-v2"

#: Placeholder for the "empty input" embedding – a zero vector whose
#: dimension is filled in once the model has loaded.
_ZERO_EMBEDDING: Optional[np.ndarray] = None


def _load_model() -> SentenceTransformer:
    """
    Load (or download) the Sentence Transformer model.

    Called once at module import.  The HuggingFace cache (~/.cache/huggingface)
    means subsequent imports reuse the local copy with no network access.
    """
    logger.info("Loading Sentence Transformer model: %s", MODEL_NAME)
    model = SentenceTransformer(MODEL_NAME)
    logger.info(
        "Model loaded. Embedding dimension: %d",
        model.get_embedding_dimension(),
    )
    return model


# Module-level singleton – loaded once, reused forever.
_MODEL: SentenceTransformer = _load_model()

# Zero vector matching the model's output dimension (used for empty inputs).
_ZERO_EMBEDDING = np.zeros(_MODEL.get_embedding_dimension(), dtype=np.float32)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def generate_embedding(text: str) -> np.ndarray:
    """
    Encode *text* into a dense embedding vector.

    Parameters
    ----------
    text : str
        The input text (resume excerpt, job description, sentence, etc.).

    Returns
    -------
    np.ndarray
        1-D float32 array of shape (embedding_dim,).
        Returns a zero vector of the correct dimension for empty / non-string
        input so callers never receive ``None`` or an exception.
    """
    # Guard: non-string or blank input
    if not isinstance(text, str) or not text.strip():
        logger.warning("generate_embedding received empty/invalid input; returning zero vector.")
        return _ZERO_EMBEDDING.copy()

    # encode() returns a numpy array when convert_to_tensor=False (default)
    embedding: np.ndarray = _MODEL.encode(text, convert_to_tensor=False)
    return embedding.astype(np.float32)


def cosine_similarity(text_a: str, text_b: str) -> float:
    """
    Compute the cosine similarity between two text strings.

    Cosine similarity is defined as:

        sim(a, b) = dot(a, b) / (||a|| * ||b||)

    and lies in [-1, 1].  In practice, sentence embeddings from
    all-MiniLM-L6-v2 are non-negative after normalisation, so results
    typically fall in [0, 1].

    Parameters
    ----------
    text_a : str
        First text (e.g. resume text).
    text_b : str
        Second text (e.g. job description).

    Returns
    -------
    float
        Similarity score in [-1, 1].  Returns 0.0 when either input is
        empty / invalid so that downstream consumers receive a safe value.
    """
    emb_a = generate_embedding(text_a)
    emb_b = generate_embedding(text_b)

    norm_a = float(np.linalg.norm(emb_a))
    norm_b = float(np.linalg.norm(emb_b))

    # If either vector is the zero vector (empty input), similarity is 0.
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    similarity = float(np.dot(emb_a, emb_b) / (norm_a * norm_b))

    # Clamp to [-1, 1] to absorb any floating-point drift
    return max(-1.0, min(1.0, similarity))
