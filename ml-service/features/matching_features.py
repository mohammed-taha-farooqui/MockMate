"""
matching_features.py
====================
Feature 4C – ML-Ready Matching Feature Vector

PURPOSE
-------
Combines deterministic matching features (skill overlap, keyword overlap
from Feature 4A) with Sentence Transformer semantic similarity (from Feature 4B)
into a structured dictionary and ML-ready numeric feature vector.

GUARANTEES & DESIGN CONSTRAINTS
--------------------------------
1. Reuses `cosine_similarity(resume_text, jd_text)` from `features.embeddings`.
2. Safe handling of empty/None strings, non-numeric inputs, and type conversion.
3. Output feature vector is exactly:
       [semantic_similarity, skill_overlap, keyword_overlap]
4. Pure feature transformation: no dataset creation, no model training,
   no classification, no regression, and no prediction logic.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Union

try:
    from .embeddings import cosine_similarity
except ImportError:
    try:
        from features.embeddings import cosine_similarity
    except ImportError:
        from embeddings import cosine_similarity

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal Helpers
# ---------------------------------------------------------------------------

def _safe_float(value: Any, default: float = 0.0) -> float:
    """
    Safely convert an input value to float.

    Parameters
    ----------
    value : Any
        Value to convert (float, int, numeric str, None, etc.).
    default : float, optional
        Fallback value if conversion fails, default 0.0.

    Returns
    -------
    float
        Converted float value or default fallback.
    """
    if value is None:
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        logger.warning(
            "_safe_float received non-convertible value %r; falling back to default %f",
            value,
            default,
        )
        return default


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def build_matching_feature_vector(
    resume_text: str | None,
    jd_text: str | None,
    skill_overlap: float | int | str | None,
    keyword_overlap: float | int | str | None,
) -> Dict[str, Union[float, List[float]]]:
    """
    Construct an ML-ready matching feature vector combining semantic similarity
    and deterministic overlap metrics.

    Parameters
    ----------
    resume_text : str | None
        Extracted text content from the candidate's resume.
    jd_text : str | None
        Text content or description of the job description.
    skill_overlap : float | int | str | None
        Fraction or score representing skill match between resume and job description.
    keyword_overlap : float | int | str | None
        Fraction or score representing keyword overlap between resume and job description.

    Returns
    -------
    dict
        Dictionary with keys:
        {
            "semantic_similarity": float,
            "skill_overlap": float,
            "keyword_overlap": float,
            "feature_vector": [float, float, float]
        }
    """
    # 1. Semantic similarity calculated using existing Feature 4B function
    # cosine_similarity handles empty/None/non-string inputs safely by returning 0.0
    sim_score = float(cosine_similarity(resume_text, jd_text))

    # 2. Convert skill_overlap and keyword_overlap safely to float
    skill_score = _safe_float(skill_overlap, 0.0)
    keyword_score = _safe_float(keyword_overlap, 0.0)

    # 3. Construct exactly 3-element vector in specified order
    feature_vector: List[float] = [
        sim_score,
        skill_score,
        keyword_score,
    ]

    return {
        "semantic_similarity": sim_score,
        "skill_overlap": skill_score,
        "keyword_overlap": keyword_score,
        "feature_vector": feature_vector,
    }
