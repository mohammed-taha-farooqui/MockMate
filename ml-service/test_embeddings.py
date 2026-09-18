"""
test_embeddings.py
==================
Standalone smoke-tests for Feature 4B (embeddings.py).

Run with:
    python ml-service/test_embeddings.py
  or (from inside ml-service/):
    python test_embeddings.py

No pytest or any external test framework required – uses Python's
built-in assert plus explicit PASS / FAIL reporting.

Tests
-----
1.  Identical text -> similarity >= 0.99
2.  Highly similar text (paraphrase) -> high similarity (>= 0.80)
3.  Clearly unrelated text -> lower similarity (< 0.70)
4.  Empty string input handled safely (no exception, returns 0.0 similarity)
5.  Non-string input handled safely (no exception)
6.  Embedding dimension is consistent across different inputs
7.  Repeated calls return identical results (model not reloaded)
8.  Resume vs matching JD -> higher sim than resume vs unrelated JD
9.  Similarity is symmetric: sim(a, b) == sim(b, a)
10. Similarity is in the valid cosine range [-1, 1]
"""

from __future__ import annotations

import sys
import time

# ---------------------------------------------------------------------------
# Import the module under test
# Supports running both from project root and from inside ml-service/
# ---------------------------------------------------------------------------
try:
    from features.embeddings import cosine_similarity, generate_embedding, _MODEL, MODEL_NAME
except ModuleNotFoundError:
    # Fallback: running from ml-service/ directory
    import os
    sys.path.insert(0, os.path.dirname(__file__))
    from features.embeddings import cosine_similarity, generate_embedding, _MODEL, MODEL_NAME

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

passed = 0
failed = 0


def test(name: str, fn) -> None:
    global passed, failed
    try:
        fn()
        print(f"  [PASS] {name}")
        passed += 1
    except Exception as exc:
        print(f"  [FAIL] {name}")
        print(f"         {exc}")
        failed += 1


# ---------------------------------------------------------------------------
# Sample data
# ---------------------------------------------------------------------------

RESUME_TEXT = (
    "Experienced full-stack software engineer with 4 years of experience "
    "building scalable web applications using React, Node.js, and MongoDB. "
    "Proficient in REST API design, Docker, and AWS cloud deployment. "
    "Strong background in agile development and CI/CD pipelines."
)

MATCHING_JD = (
    "We are looking for a Full Stack Engineer to join our team. "
    "Requirements: React, Node.js, MongoDB, Docker, AWS. "
    "Nice to have: TypeScript, GraphQL, Kubernetes. "
    "You will design and build REST APIs and work in an agile environment."
)

UNRELATED_JD = (
    "Sous chef position available at an upscale Italian restaurant. "
    "Must have 3 years of culinary experience, knowledge of pasta-making, "
    "wine pairing, and kitchen management. ServSafe certification required."
)

PARAPHRASE = (
    "Skilled full-stack developer with expertise in React, Node.js, and "
    "MongoDB. Has deployed applications on AWS using Docker containers and "
    "follows agile practices with continuous integration workflows."
)

IDENTICAL = RESUME_TEXT  # deliberately the same string


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

print(f"\n=== Feature 4B: Sentence Transformer Tests ===")
print(f"Model: {MODEL_NAME}")
print(f"Embedding dimension: {_MODEL.get_embedding_dimension()}\n")


# 1. Identical text -> similarity ~ 1.0
def _t1():
    sim = cosine_similarity(RESUME_TEXT, IDENTICAL)
    assert sim >= 0.99, f"Expected >= 0.99 for identical text, got {sim:.4f}"


test("Identical text gives similarity >= 0.99", _t1)


# 2. Paraphrase -> high similarity
def _t2():
    sim = cosine_similarity(RESUME_TEXT, PARAPHRASE)
    assert sim >= 0.80, f"Expected >= 0.80 for paraphrase, got {sim:.4f}"
    print(f"         (paraphrase similarity: {sim:.4f})")


test("Paraphrase gives high similarity (>= 0.80)", _t2)


# 3. Unrelated text -> lower similarity
def _t3():
    sim_match = cosine_similarity(RESUME_TEXT, MATCHING_JD)
    sim_unrel = cosine_similarity(RESUME_TEXT, UNRELATED_JD)
    assert sim_unrel < 0.70, f"Expected < 0.70 for unrelated text, got {sim_unrel:.4f}"
    print(f"         (matching JD sim: {sim_match:.4f}, unrelated JD sim: {sim_unrel:.4f})")


test("Clearly unrelated text gives lower similarity (< 0.70)", _t3)


# 4. Empty string -> 0.0, no exception
def _t4():
    sim = cosine_similarity("", RESUME_TEXT)
    assert sim == 0.0, f"Expected 0.0 for empty input, got {sim}"
    sim2 = cosine_similarity(RESUME_TEXT, "")
    assert sim2 == 0.0, f"Expected 0.0 for empty second input, got {sim2}"
    sim3 = cosine_similarity("", "")
    assert sim3 == 0.0, f"Expected 0.0 for both empty, got {sim3}"


test("Empty string inputs handled safely (returns 0.0)", _t4)


# 5. Non-string input -> 0.0 embedding, no exception
def _t5():
    emb = generate_embedding(None)  # type: ignore[arg-type]
    assert emb is not None, "Expected ndarray, got None"
    sim = cosine_similarity(None, RESUME_TEXT)  # type: ignore[arg-type]
    assert sim == 0.0, f"Expected 0.0 for None input, got {sim}"


test("Non-string input handled safely (returns 0.0)", _t5)


# 6. Embedding dimension is consistent
def _t6():
    dim = _MODEL.get_embedding_dimension()
    emb_a = generate_embedding(RESUME_TEXT)
    emb_b = generate_embedding(MATCHING_JD)
    emb_c = generate_embedding("hello")
    assert emb_a.shape == (dim,), f"Wrong shape: {emb_a.shape}"
    assert emb_b.shape == (dim,), f"Wrong shape: {emb_b.shape}"
    assert emb_c.shape == (dim,), f"Wrong shape: {emb_c.shape}"
    print(f"         (all embeddings have shape ({dim},) [OK])")


test("Embedding dimension is consistent across inputs", _t6)


# 7. Repeated calls return identical results (no model reload)
def _t7():
    t0 = time.perf_counter()
    emb1 = generate_embedding(RESUME_TEXT)
    t1 = time.perf_counter()
    emb2 = generate_embedding(RESUME_TEXT)
    t2 = time.perf_counter()

    import numpy as np
    assert np.allclose(emb1, emb2, atol=1e-6), "Repeated calls returned different embeddings"
    print(f"         (call 1: {(t1-t0)*1000:.1f} ms, call 2: {(t2-t1)*1000:.1f} ms – model NOT reloaded)")


test("Repeated calls return identical embeddings (model reused)", _t7)


# 8. Matching JD has higher similarity than unrelated JD
def _t8():
    sim_match = cosine_similarity(RESUME_TEXT, MATCHING_JD)
    sim_unrel = cosine_similarity(RESUME_TEXT, UNRELATED_JD)
    assert sim_match > sim_unrel, (
        f"Expected sim(resume, matching_JD) > sim(resume, unrelated_JD), "
        f"got {sim_match:.4f} vs {sim_unrel:.4f}"
    )
    print(f"         (matching: {sim_match:.4f} > unrelated: {sim_unrel:.4f} [OK])")


test("Resume vs matching JD has higher similarity than vs unrelated JD", _t8)


# 9. Similarity is symmetric
def _t9():
    sim_ab = cosine_similarity(RESUME_TEXT, MATCHING_JD)
    sim_ba = cosine_similarity(MATCHING_JD, RESUME_TEXT)
    assert abs(sim_ab - sim_ba) < 1e-5, (
        f"Expected symmetric similarity, got {sim_ab:.6f} vs {sim_ba:.6f}"
    )


test("Similarity is symmetric: sim(a, b) == sim(b, a)", _t9)


# 10. Similarity is in valid cosine range
def _t10():
    pairs = [
        (RESUME_TEXT, MATCHING_JD),
        (RESUME_TEXT, UNRELATED_JD),
        (RESUME_TEXT, PARAPHRASE),
        ("", RESUME_TEXT),
    ]
    for a, b in pairs:
        sim = cosine_similarity(a, b)
        assert -1.0 <= sim <= 1.0, f"Out-of-range similarity {sim:.4f} for pair ({a[:20]!r}, {b[:20]!r})"


test("All similarity scores are in valid range [-1, 1]", _t10)


# ---------------------------------------------------------------------------
# Example output section
# ---------------------------------------------------------------------------
print("\n=== Example Similarity Scores ===")
pairs = [
    ("Resume vs Matching JD", RESUME_TEXT, MATCHING_JD),
    ("Resume vs Unrelated JD (chef)", RESUME_TEXT, UNRELATED_JD),
    ("Resume vs Paraphrase", RESUME_TEXT, PARAPHRASE),
    ("Resume vs Itself", RESUME_TEXT, IDENTICAL),
    ("Empty vs Resume", "", RESUME_TEXT),
]
for label, a, b in pairs:
    score = cosine_similarity(a, b)
    bar = "|" * int(score * 30)
    print(f"  {label:<35} {score:.4f}  [{bar}]")

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
print(f"\n{'='*44}")
print(f"Results: {passed} passed, {failed} failed")
if failed > 0:
    sys.exit(1)
