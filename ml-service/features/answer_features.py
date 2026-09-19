"""
answer_features.py
==================
Feature Extraction for Answer Analysis ML

PURPOSE
-------
Provides reusable functions to extract 4 numerical features from a candidate's answer
given the question text and reference answer:

1. semantic_similarity: SentenceTransformer cosine similarity [0.0, 1.0].
2. keyword_overlap: Stopword-filtered token overlap ratio [0.0, 1.0].
3. answer_length: Bounded, log-normalized length feature [0.0, 1.0].
4. technical_keyword_count: Count of unique technical keywords present in candidate answer.

REUSE & SAFETY
--------------
- Reuses `cosine_similarity` from `embeddings.py`.
- Safe against None / empty / non-string inputs.
- Fully deterministic.
"""

from __future__ import annotations

import logging
import math
import re
from typing import Any, Dict, List, Set

try:
    from .embeddings import cosine_similarity
except ImportError:
    try:
        from features.embeddings import cosine_similarity
    except ImportError:
        from embeddings import cosine_similarity

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Technical Vocabulary
# ---------------------------------------------------------------------------
TECHNICAL_VOCAB: Set[str] = {
    # Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "scala", "kotlin", "swift", "ruby", "php", "sql", "html", "css", "bash", "shell",
    # Frameworks & Libraries
    "react", "angular", "vue", "node", "express", "django", "flask", "fastapi",
    "spring", "rails", "nextjs", "pandas", "numpy", "scikit", "tensorflow",
    "pytorch", "keras", "spark", "hadoop",
    # Cloud, DevOps & Databases
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "ci/cd", "linux", "git", "github", "mysql", "postgresql",
    "mongodb", "redis", "elasticsearch", "dynamodb", "oracle",
    # Architecture & Concepts
    "rest", "rest api", "graphql", "microservices", "agile", "scrum",
    "oops", "object oriented", "data structures", "algorithms", "async",
    "concurrency", "multithreading", "api", "json", "jwt", "oauth",
    "machine learning", "deep learning", "nlp", "rag", "llm"
}

# Standard English Stop Words (lightweight, zero dependency)
STOP_WORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
    "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down",
    "during", "each", "few", "for", "from", "further", "had", "hadn't", "has",
    "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
    "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
    "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
    "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
    "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't",
    "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves"
}


def _clean_and_tokenize(text: str | None) -> List[str]:
    """Lowercase, strip non-alphanumeric (except spaces), and tokenize."""
    if not isinstance(text, str) or not text.strip():
        return []
    lowered = text.lower()
    cleaned = re.sub(r"[^a-z0-9\s]", " ", lowered)
    tokens = [t for t in cleaned.split() if t]
    return tokens


def _compute_keyword_overlap(cand_text: str | None, ref_text: str | None) -> float:
    """Calculate token overlap ratio between candidate answer and reference answer (excluding stopwords)."""
    cand_tokens = set(_clean_and_tokenize(cand_text)) - STOP_WORDS
    ref_tokens = set(_clean_and_tokenize(ref_text)) - STOP_WORDS

    if not ref_tokens or not cand_tokens:
        return 0.0

    intersection = cand_tokens & ref_tokens
    union = cand_tokens | ref_tokens
    return round(len(intersection) / len(union), 4)


def _compute_answer_length_feature(cand_text: str | None, target_word_count: int = 100) -> float:
    """
    Log-normalized answer length feature bounded in [0.0, 1.0].
    
    Prevents long answers from scaling infinitely while giving diminishing returns
    for answers past optimal length (~100 words).
    """
    tokens = _clean_and_tokenize(cand_text)
    word_count = len(tokens)
    if word_count == 0:
        return 0.0

    # Log1p normalization: log(1 + word_count) / log(1 + target_word_count)
    score = math.log1p(word_count) / math.log1p(target_word_count)
    return round(min(1.0, max(0.0, score)), 4)


def _count_technical_keywords(cand_text: str | None) -> int:
    """Count unique technical keywords appearing in candidate answer."""
    if not isinstance(cand_text, str) or not cand_text.strip():
        return 0
    
    text_lower = cand_text.lower()
    found_count = 0
    for term in TECHNICAL_VOCAB:
        # Match as whole phrase / word boundaries
        pattern = r"\b" + re.escape(term) + r"\b"
        if re.search(pattern, text_lower):
            found_count += 1

    return found_count


def extract_answer_features(
    question_text: str | None,
    reference_answer: str | None,
    candidate_answer: str | None
) -> Dict[str, float]:
    """
    Extract 4 numerical features for answer scoring ML model.

    Parameters
    ----------
    question_text : str | None
        Text of the question asked.
    reference_answer : str | None
        Target ground truth or reference answer.
    candidate_answer : str | None
        Candidate's spoken or typed answer.

    Returns
    -------
    dict
        {
            "semantic_similarity": float,
            "keyword_overlap": float,
            "answer_length": float,
            "technical_keyword_count": int | float
        }
    """
    # Fall back to question_text if reference_answer is missing/empty
    target_ref = reference_answer if (isinstance(reference_answer, str) and reference_answer.strip()) else question_text

    # 1. Semantic Similarity
    if not isinstance(candidate_answer, str) or not candidate_answer.strip() or not target_ref or not isinstance(target_ref, str) or not target_ref.strip():
        sem_sim = 0.0
    else:
        raw_sim = cosine_similarity(candidate_answer, target_ref)
        sem_sim = round(float(max(0.0, min(1.0, raw_sim))), 4)

    # 2. Keyword Overlap
    kw_overlap = _compute_keyword_overlap(candidate_answer, target_ref)

    # 3. Answer Length Feature
    ans_length = _compute_answer_length_feature(candidate_answer)

    # 4. Technical Keyword Count
    tech_count = _count_technical_keywords(candidate_answer)

    return {
        "semantic_similarity": sem_sim,
        "keyword_overlap": kw_overlap,
        "answer_length": ans_length,
        "technical_keyword_count": tech_count
    }


def extract_answer_feature_vector(
    question_text: str | None,
    reference_answer: str | None,
    candidate_answer: str | None
) -> List[float]:
    """
    Extract answer features and return as a 4-element numeric feature vector list.

    Order:
    [semantic_similarity, keyword_overlap, answer_length, technical_keyword_count]
    """
    features = extract_answer_features(question_text, reference_answer, candidate_answer)
    return [
        features["semantic_similarity"],
        features["keyword_overlap"],
        features["answer_length"],
        float(features["technical_keyword_count"])
    ]
