"""
rag_service.py
==============
Feature: Local RAG Retrieval ONLY (FAISS + Sentence Transformers)

PURPOSE
-------
Provides a lightweight, local, free RAG retrieval service that:
  1. Loads technical reference markdown files from `rag/knowledge/`.
  2. Performs deterministic text chunking.
  3. Generates dense embeddings using `all-MiniLM-L6-v2` via `features.embeddings`.
  4. Stores embeddings in a local FAISS index (`rag/vector_store/index.faiss`).
  5. Provides `retrieve_context(query, top_k=3)` for semantic similarity search.

NO LLM, NO external APIs, NO paid databases.
"""

from __future__ import annotations

import json
import logging
import os
import pickle
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import faiss
import numpy as np

# ---------------------------------------------------------------------------
# Path resolution to reuse existing `features.embeddings` module
# ---------------------------------------------------------------------------
_BASE_DIR = Path(__file__).resolve().parent.parent
if str(_BASE_DIR) not in sys.path:
    sys.path.insert(0, str(_BASE_DIR))

from features.embeddings import generate_embedding  # noqa: E402

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
RAG_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = RAG_DIR / "knowledge"
VECTOR_STORE_DIR = RAG_DIR / "vector_store"
INDEX_FILE = VECTOR_STORE_DIR / "index.faiss"
METADATA_FILE = VECTOR_STORE_DIR / "metadata.pkl"

# Singleton in-memory state
_FAISS_INDEX: Optional[faiss.Index] = None
_CHUNKS_METADATA: List[Dict[str, Any]] = []


# ---------------------------------------------------------------------------
# Text Chunking Logic
# ---------------------------------------------------------------------------

def chunk_document(file_path: Path) -> List[Dict[str, Any]]:
    """
    Deterministically chunk a markdown document by headers (##) and sections.

    Returns list of dicts:
        [
            {
                "text": "...",
                "source": "javascript.md",
                "heading": "Event Loop and Concurrency"
            }
        ]
    """
    source_name = file_path.name
    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as exc:
        logger.error("Failed to read knowledge file %s: %s", file_path, exc)
        return []

    sections = content.split("\n## ")
    chunks: List[Dict[str, Any]] = []

    for idx, section in enumerate(sections):
        section_text = section.strip()
        if not section_text:
            continue

        if idx > 0:
            section_text = "## " + section_text

        lines = section_text.split("\n")
        heading = lines[0].replace("#", "").strip() if lines else source_name
        body = "\n".join(lines[1:]).strip() if len(lines) > 1 else section_text

        if body:
            chunk_text = f"{heading}\n{body}" if heading else body
            chunks.append({
                "text": chunk_text,
                "source": source_name,
                "heading": heading,
            })

    return chunks


def load_all_chunks() -> List[Dict[str, Any]]:
    """Load and chunk all markdown documents in `rag/knowledge/`."""
    if not KNOWLEDGE_DIR.exists():
        logger.warning("Knowledge directory %s does not exist.", KNOWLEDGE_DIR)
        return []

    all_chunks: List[Dict[str, Any]] = []
    for filepath in sorted(KNOWLEDGE_DIR.glob("*.md")):
        doc_chunks = chunk_document(filepath)
        all_chunks.extend(doc_chunks)

    logger.info("Loaded %d total chunks from %s", len(all_chunks), KNOWLEDGE_DIR)
    return all_chunks


# ---------------------------------------------------------------------------
# Index Management (FAISS)
# ---------------------------------------------------------------------------

def build_index(force_rebuild: bool = False) -> Tuple[faiss.Index, List[Dict[str, Any]]]:
    """
    Build (or load from disk) the FAISS vector index and chunk metadata.
    """
    global _FAISS_INDEX, _CHUNKS_METADATA

    if not force_rebuild and INDEX_FILE.exists() and METADATA_FILE.exists():
        try:
            _FAISS_INDEX = faiss.read_index(str(INDEX_FILE))
            with open(METADATA_FILE, "rb") as f:
                _CHUNKS_METADATA = pickle.load(f)
            logger.info("Successfully loaded FAISS index (%d vectors) from %s", _FAISS_INDEX.ntotal, INDEX_FILE)
            return _FAISS_INDEX, _CHUNKS_METADATA
        except Exception as exc:
            logger.warning("Error loading existing FAISS index (%s). Rebuilding...", exc)

    chunks = load_all_chunks()
    if not chunks:
        logger.warning("No chunks found to build FAISS index.")
        dim = 384
        index = faiss.IndexFlatIP(dim)
        _FAISS_INDEX = index
        _CHUNKS_METADATA = []
        return _FAISS_INDEX, _CHUNKS_METADATA

    embeddings_list = []
    for chunk in chunks:
        vec = generate_embedding(chunk["text"])
        embeddings_list.append(vec)

    embeddings_matrix = np.array(embeddings_list, dtype=np.float32)
    faiss.normalize_L2(embeddings_matrix)  # Normalize for cosine similarity via Inner Product

    dim = embeddings_matrix.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings_matrix)

    VECTOR_STORE_DIR.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(INDEX_FILE))
    with open(METADATA_FILE, "wb") as f:
        pickle.dump(chunks, f)

    _FAISS_INDEX = index
    _CHUNKS_METADATA = chunks
    logger.info("Built and saved new FAISS index with %d vectors to %s", index.ntotal, INDEX_FILE)

    return _FAISS_INDEX, _CHUNKS_METADATA


def _ensure_index_loaded() -> Tuple[faiss.Index, List[Dict[str, Any]]]:
    global _FAISS_INDEX, _CHUNKS_METADATA
    if _FAISS_INDEX is None or not _CHUNKS_METADATA:
        return build_index()
    return _FAISS_INDEX, _CHUNKS_METADATA


# ---------------------------------------------------------------------------
# Public Retrieval API
# ---------------------------------------------------------------------------

def retrieve_context(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Retrieve the top-k most relevant knowledge chunks for a query.

    Parameters
    ----------
    query : str
        The query text (e.g. skill gap "React Event Loop", "Closure in JavaScript").
    top_k : int
        Number of relevant context chunks to retrieve (default 3).

    Returns
    -------
    List[Dict[str, Any]]
        List of retrieved chunk objects:
        [
            {
                "text": "...",
                "source": "javascript.md",
                "score": float  # Cosine similarity in [0, 1]
            }
        ]
    """
    if not isinstance(query, str) or not query.strip():
        logger.warning("retrieve_context received empty query; returning empty list.")
        return []

    index, chunks = _ensure_index_loaded()

    if index is None or index.ntotal == 0 or not chunks:
        logger.warning("FAISS index is empty; returning empty list.")
        return []

    top_k = max(1, min(top_k, index.ntotal))

    query_vec = generate_embedding(query.strip())
    query_matrix = np.array([query_vec], dtype=np.float32)
    faiss.normalize_L2(query_matrix)

    distances, indices = index.search(query_matrix, top_k)

    results: List[Dict[str, Any]] = []
    for rank in range(top_k):
        idx = int(indices[0][rank])
        score = float(distances[0][rank])
        if 0 <= idx < len(chunks):
            chunk_info = chunks[idx]
            results.append({
                "text": chunk_info["text"],
                "source": chunk_info["source"],
                "score": round(max(0.0, min(1.0, score)), 4),
            })

    return results
