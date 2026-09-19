"""
app.py
======
Feature 4D – Python FastAPI ML Inference Service

PURPOSE
-------
Provides a REST API that:
  1. Loads the trained LogisticRegression model (resume_job_match_model.joblib)
     and label mapping (label_mapping.joblib) ONCE at startup.
  2. GET  /health  – liveness probe.
  3. POST /predict – accepts resume_text + job_description, computes 6 features,
     runs model inference, and returns matchScore, fitClass, and feature breakdown.

FEATURE VECTOR (exactly 6, in this order):
  [semantic_similarity, skill_overlap, keyword_overlap,
   experience_match, education_match, role_match]

Run:
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload
"""

from __future__ import annotations

import logging
import re
import sys
from pathlib import Path
from typing import Dict

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, field_validator

# ---------------------------------------------------------------------------
# Path setup – make `features/` importable when running from ml-service/
# ---------------------------------------------------------------------------
_BASE_DIR = Path(__file__).resolve().parent
if str(_BASE_DIR) not in sys.path:
    sys.path.insert(0, str(_BASE_DIR))

from features.embeddings import cosine_similarity  # noqa: E402
from features.answer_features import extract_answer_features  # noqa: E402

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MODEL_PATH = _BASE_DIR / "models" / "resume_job_match_model.joblib"
LABEL_MAP_PATH = _BASE_DIR / "models" / "label_mapping.joblib"
ANSWER_MODEL_PATH = _BASE_DIR / "models" / "answer_scoring_model.joblib"

# ---------------------------------------------------------------------------
# Text cleaning – MUST match Colab training pre-processing exactly
# ---------------------------------------------------------------------------

def clean_text(text: str) -> str:
    """
    Deterministic text cleaning applied identically during training and inference.

    Steps (mirror Colab notebook):
    1. Lowercase
    2. Strip HTML tags
    3. Replace non-alphanumeric characters (except spaces) with a space
    4. Collapse multiple whitespace into a single space
    5. Strip leading/trailing whitespace
    """
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"<[^>]+>", " ", text)          # remove HTML tags
    text = re.sub(r"[^a-z0-9\s]", " ", text)       # keep only alphanumeric + spaces
    text = re.sub(r"\s+", " ", text)               # collapse whitespace
    return text.strip()


# ---------------------------------------------------------------------------
# Feature helpers – deterministic, vocabulary-based matching
# ---------------------------------------------------------------------------

_EXPERIENCE_PATTERNS = [
    r"\b(\d+)\s*\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)\b",
    r"\bexperience\s*[:\-]?\s*(\d+)\s*\+?\s*(?:years?|yrs?)\b",
]
_EXP_LEVELS = {
    "entry": 0, "junior": 1, "mid": 2, "senior": 3, "lead": 4,
    "principal": 5, "staff": 5, "director": 6, "vp": 7,
}

_EDUCATION_KEYWORDS = {
    "phd": 4, "doctorate": 4, "doctoral": 4,
    "masters": 3, "master": 3, "msc": 3, "mba": 3, "ms ": 3,
    "bachelors": 2, "bachelor": 2, "bsc": 2, "be ": 2, "btech": 2, "beng": 2,
    "associate": 1, "diploma": 1,
    "high school": 0, "ged": 0,
}

_ROLE_KEYWORDS: Dict[str, list] = {
    "software_engineer": ["software engineer", "software developer", "swe", "programmer"],
    "data_scientist": ["data scientist", "data science", "ml engineer", "machine learning engineer"],
    "data_analyst": ["data analyst", "business analyst", "analyst"],
    "product_manager": ["product manager", "pm ", "product owner"],
    "designer": ["ux designer", "ui designer", "graphic designer", "designer"],
    "devops": ["devops", "site reliability", "sre", "cloud engineer", "infrastructure"],
    "qa_engineer": ["qa engineer", "quality assurance", "test engineer", "tester"],
    "project_manager": ["project manager", "scrum master", "agile coach"],
    "manager": ["engineering manager", "tech lead", "team lead", "manager"],
    "backend": ["backend", "back end", "server side"],
    "frontend": ["frontend", "front end", "ui developer"],
    "fullstack": ["full stack", "fullstack"],
    "mobile": ["mobile developer", "ios developer", "android developer", "react native"],
    "security": ["security engineer", "cybersecurity", "infosec", "penetration tester"],
    "database": ["database administrator", "dba", "database engineer"],
}


def _extract_years(text: str) -> float:
    years_found = []
    for pattern in _EXPERIENCE_PATTERNS:
        for match in re.finditer(pattern, text):
            try:
                years_found.append(float(match.group(1)))
            except (IndexError, ValueError):
                pass
    return max(years_found) if years_found else 0.0


def _extract_exp_level(text: str) -> int:
    max_level = -1
    for keyword, level in _EXP_LEVELS.items():
        if re.search(r"\b" + keyword + r"\b", text):
            max_level = max(max_level, level)
    return max_level


def compute_experience_match(resume: str, jd: str) -> float:
    resume_years = _extract_years(resume)
    jd_years = _extract_years(jd)

    if jd_years > 0 and resume_years > 0:
        year_score = min(1.0, resume_years / jd_years)
    elif jd_years == 0 and resume_years > 0:
        year_score = 1.0
    elif jd_years == 0 and resume_years == 0:
        year_score = 0.5
    else:
        year_score = 0.0

    resume_level = _extract_exp_level(resume)
    jd_level = _extract_exp_level(jd)

    if resume_level == -1 and jd_level == -1:
        level_score = 0.5
    elif resume_level == -1 or jd_level == -1:
        level_score = 0.5
    elif resume_level == jd_level:
        level_score = 1.0
    elif abs(resume_level - jd_level) == 1:
        level_score = 0.5
    else:
        level_score = 0.0

    return round((year_score + level_score) / 2.0, 4)


def _extract_education_level(text: str) -> int:
    max_level = -1
    for keyword, level in _EDUCATION_KEYWORDS.items():
        if keyword in text:
            max_level = max(max_level, level)
    return max_level


def compute_education_match(resume: str, jd: str) -> float:
    resume_edu = _extract_education_level(resume)
    jd_edu = _extract_education_level(jd)

    if jd_edu == -1:
        return 1.0 if resume_edu >= 0 else 0.5

    if resume_edu == -1:
        return 0.0

    if resume_edu >= jd_edu:
        return 1.0

    diff = jd_edu - resume_edu
    if diff == 1:
        return 0.5
    return 0.0


def _detect_roles(text: str) -> set:
    found = set()
    for role_key, phrases in _ROLE_KEYWORDS.items():
        for phrase in phrases:
            if phrase in text:
                found.add(role_key)
                break
    return found


def compute_role_match(resume: str, jd: str) -> float:
    resume_roles = _detect_roles(resume)
    jd_roles = _detect_roles(jd)

    if not resume_roles and not jd_roles:
        return 0.5

    if not resume_roles or not jd_roles:
        return 0.0

    intersection = resume_roles & jd_roles
    union = resume_roles | jd_roles
    return round(len(intersection) / len(union), 4)


# ---------------------------------------------------------------------------
# Skill / keyword overlap (deterministic bag-of-words)
# ---------------------------------------------------------------------------

_SKILL_VOCAB: list = [
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "scala", "kotlin", "swift", "ruby", "php", "matlab",
    "react", "angular", "vue", "node", "express", "django", "flask", "fastapi",
    "spring", "rails", "laravel", "nextjs", "gatsby",
    "tensorflow", "pytorch", "keras", "scikit", "pandas", "numpy", "spark",
    "hadoop", "kafka", "airflow", "mlflow", "huggingface",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "ci/cd", "linux",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "dynamodb", "cassandra", "oracle",
    "rest api", "graphql", "microservices", "agile", "scrum", "git",
    "machine learning", "deep learning", "nlp", "computer vision",
]

_KEYWORD_VOCAB: list = [
    "communication", "leadership", "teamwork", "collaboration", "problem solving",
    "analytical", "detail oriented", "self motivated", "fast learner", "proactive",
    "critical thinking", "creativity", "adaptability", "time management",
    "project management", "stakeholder", "cross functional", "mentoring",
]


def _token_overlap(text_a: str, text_b: str, vocab: list) -> float:
    in_a = {term for term in vocab if term in text_a}
    in_b = {term for term in vocab if term in text_b}
    union = in_a | in_b
    if not union:
        return 0.0
    return round(len(in_a & in_b) / len(union), 4)


def compute_skill_overlap(resume: str, jd: str) -> float:
    return _token_overlap(resume, jd, _SKILL_VOCAB)


def compute_keyword_overlap(resume: str, jd: str) -> float:
    return _token_overlap(resume, jd, _KEYWORD_VOCAB)


# ---------------------------------------------------------------------------
# Feature vector builder (6-feature, order-fixed)
# ---------------------------------------------------------------------------

def build_feature_vector(resume_text: str, jd_text: str):
    """
    Compute all 6 features and return (pandas_DataFrame_1x6, feature_dict).

    Feature order (must match training):
        [semantic_similarity, skill_overlap, keyword_overlap,
         experience_match, education_match, role_match]
    """
    r_clean = clean_text(resume_text)
    j_clean = clean_text(jd_text)

    sem_sim = float(cosine_similarity(r_clean, j_clean))
    skill = compute_skill_overlap(r_clean, j_clean)
    keyword = compute_keyword_overlap(r_clean, j_clean)
    experience = compute_experience_match(r_clean, j_clean)
    education = compute_education_match(r_clean, j_clean)
    role = compute_role_match(r_clean, j_clean)

    features = {
        "semantic_similarity": round(sem_sim, 6),
        "skill_overlap": round(skill, 6),
        "keyword_overlap": round(keyword, 6),
        "experience_match": round(experience, 6),
        "education_match": round(education, 6),
        "role_match": round(role, 6),
    }

    df = pd.DataFrame([features])

    return df, features


# ---------------------------------------------------------------------------
# Model loading (once at startup)
# ---------------------------------------------------------------------------

logger.info("Loading ML models ...")

try:
    _model = joblib.load(MODEL_PATH)
    logger.info("Loaded classifier: %s", _model)
except Exception as exc:
    logger.error("Failed to load model from %s: %s", MODEL_PATH, exc)
    raise RuntimeError(f"Cannot load model: {exc}") from exc

try:
    _label_mapping: dict = joblib.load(LABEL_MAP_PATH)
    logger.info("Loaded label mapping: %s", _label_mapping)
except Exception as exc:
    logger.error("Failed to load label mapping from %s: %s", LABEL_MAP_PATH, exc)
    raise RuntimeError(f"Cannot load label mapping: {exc}") from exc

_model_loaded: bool = True

try:
    _answer_model = joblib.load(ANSWER_MODEL_PATH)
    logger.info("Loaded answer scoring model: %s", _answer_model)
    _answer_model_loaded: bool = True
except Exception as exc:
    logger.error("Failed to load answer scoring model from %s: %s", ANSWER_MODEL_PATH, exc)
    _answer_model = None
    _answer_model_loaded = False

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="MockMate ML Inference Service",
    description="Resume vs Job Description match scoring and Answer Analysis scoring.",
    version="1.0.0",
)


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class PredictRequest(BaseModel):
    resume_text: str
    job_description: str

    @field_validator("resume_text", "job_description")
    @classmethod
    def must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field must not be empty or whitespace-only.")
        return v


class PredictResponse(BaseModel):
    matchScore: float
    fitClass: str
    features: Dict[str, float]


class PredictAnswerRequest(BaseModel):
    questionText: str
    referenceAnswer: str = ""
    candidateAnswer: str

    @field_validator("questionText", "candidateAnswer")
    @classmethod
    def must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field must not be empty or whitespace-only.")
        return v


class AnswerFeaturesResponse(BaseModel):
    semanticSimilarity: float
    keywordOverlap: float
    answerLength: float
    technicalKeywordCount: float


class PredictAnswerResponse(BaseModel):
    score: float
    features: AnswerFeaturesResponse


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
async def health() -> dict:
    """Liveness probe – returns 200 when the service and models are ready."""
    return {
        "status": "ok",
        "modelLoaded": _model_loaded,
        "answerModelLoaded": _answer_model_loaded,
    }


@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest) -> PredictResponse:
    """
    Run ML inference on a (resume, job_description) pair.

    Returns matchScore (0-100), fitClass, and all 6 feature scores.
    """
    try:
        feature_vector, feature_dict = build_feature_vector(
            request.resume_text,
            request.job_description,
        )
    except Exception as exc:
        logger.exception("Feature extraction failed")
        raise HTTPException(status_code=500, detail=f"Feature extraction error: {exc}") from exc

    try:
        # Predict class label (integer index)
        predicted_index = int(_model.predict(feature_vector)[0])

        # Probability array shape (1, n_classes)
        proba_array = _model.predict_proba(feature_vector)[0]

        # matchScore = probability of the predicted class
        predicted_probability = float(proba_array[predicted_index])
        match_score = round(predicted_probability * 100, 2)

        # Map numeric index to human-readable label
        # label_mapping may be stored as {int: str} or {str: int}
        first_key = next(iter(_label_mapping))
        if isinstance(first_key, str):
            # {label_str: int_index} -> invert
            inv_map = {v: k for k, v in _label_mapping.items()}
            fit_class = inv_map.get(predicted_index, str(predicted_index))
        else:
            # {int_index: label_str}
            fit_class = _label_mapping.get(predicted_index, str(predicted_index))

    except Exception as exc:
        logger.exception("Model inference failed")
        raise HTTPException(status_code=500, detail=f"Inference error: {exc}") from exc

    logger.info(
        "Prediction: class=%s score=%.2f features=%s",
        fit_class, match_score, feature_dict,
    )

    return PredictResponse(
        matchScore=match_score,
        fitClass=str(fit_class),
        features=feature_dict,
    )


@app.post("/predict-answer", response_model=PredictAnswerResponse)
async def predict_answer(request: PredictAnswerRequest) -> PredictAnswerResponse:
    """
    Predict score (0-5 scale) for a candidate's answer based on feature extraction and Ridge regression.
    """
    if not _answer_model_loaded or _answer_model is None:
        raise HTTPException(status_code=500, detail="Answer scoring model is not loaded.")

    try:
        raw_features = extract_answer_features(
            request.questionText,
            request.referenceAnswer,
            request.candidateAnswer,
        )
    except Exception as exc:
        logger.exception("Answer feature extraction failed")
        raise HTTPException(status_code=500, detail=f"Feature extraction error: {exc}") from exc

    # Feature vector order:
    # 1. semantic_similarity
    # 2. keyword_overlap
    # 3. answer_length
    # 4. technical_keyword_count
    feature_df = pd.DataFrame([{
        "semantic_similarity": raw_features["semantic_similarity"],
        "keyword_overlap": raw_features["keyword_overlap"],
        "answer_length": raw_features["answer_length"],
        "technical_keyword_count": float(raw_features["technical_keyword_count"]),
    }])

    try:
        raw_score = float(_answer_model.predict(feature_df)[0])
        clamped_score = round(max(0.0, min(5.0, raw_score)), 2)
    except Exception as exc:
        logger.exception("Answer model inference failed")
        raise HTTPException(status_code=500, detail=f"Inference error: {exc}") from exc

    logger.info(
        "Answer Prediction: score=%.2f (raw=%.2f) features=%s",
        clamped_score, raw_score, raw_features,
    )

    return PredictAnswerResponse(
        score=clamped_score,
        features=AnswerFeaturesResponse(
            semanticSimilarity=raw_features["semantic_similarity"],
            keywordOverlap=raw_features["keyword_overlap"],
            answerLength=raw_features["answer_length"],
            technicalKeywordCount=float(raw_features["technical_keyword_count"]),
        ),
    )

