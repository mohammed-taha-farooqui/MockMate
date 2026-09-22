"""
test_matching_features.py
=========================
Smoke and unit tests for Feature 4C (features/matching_features.py).

Run with:
    py ml-service/test_matching_features.py
  or (from inside ml-service/):
    py test_matching_features.py

Tests covered:
1. Valid resume/JD returns all expected keys.
2. feature_vector contains exactly 3 values.
3. semantic_similarity matches cosine_similarity(resume_text, jd_text).
4. skill_overlap is preserved correctly.
5. keyword_overlap is preserved correctly.
6. Empty resume text is handled safely.
7. Empty JD text is handled safely.
8. Values in feature_vector are numeric.
9. Different resume/JD texts produce different semantic similarity values.
"""

from __future__ import annotations

import math
import os
import sys

# ---------------------------------------------------------------------------
# Path resolution to support running from root or ml-service/
# ---------------------------------------------------------------------------
try:
    from features.matching_features import build_matching_feature_vector
    from features.embeddings import cosine_similarity
except ModuleNotFoundError:
    sys.path.insert(0, os.path.dirname(__file__))
    from features.matching_features import build_matching_feature_vector
    from features.embeddings import cosine_similarity

# ---------------------------------------------------------------------------
# Sample Test Data
# ---------------------------------------------------------------------------

SAMPLE_RESUME = (
    "Senior Full Stack Software Engineer with 5 years of experience in JavaScript, "
    "TypeScript, React, Node.js, Express, MongoDB, and AWS cloud deployments. Built REST APIs."
)

MATCHING_JD = (
    "Looking for a Senior Full Stack Engineer proficient in React, Node.js, TypeScript, "
    "and cloud infrastructure (AWS). Must have experience building scalable web APIs."
)

UNRELATED_JD = (
    "Seeking an experienced Executive Chef to lead fine dining kitchen operations, "
    "design seasonal tasting menus, source organic ingredients, and manage pastry chefs."
)


# ---------------------------------------------------------------------------
# Test Runner Harness
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
        print(f"         Error: {exc}")
        failed += 1


# ---------------------------------------------------------------------------
# Test Functions
# ---------------------------------------------------------------------------

def test_1_expected_keys():
    """1. Valid resume/JD returns all expected keys."""
    res = build_matching_feature_vector(
        resume_text=SAMPLE_RESUME,
        jd_text=MATCHING_JD,
        skill_overlap=0.85,
        keyword_overlap=0.62,
    )
    expected_keys = {"semantic_similarity", "skill_overlap", "keyword_overlap", "feature_vector"}
    assert isinstance(res, dict), f"Expected dict, got {type(res)}"
    assert set(res.keys()) == expected_keys, f"Keys mismatch: {set(res.keys())} vs {expected_keys}"


def test_2_feature_vector_length():
    """2. feature_vector contains exactly 3 values."""
    res = build_matching_feature_vector(
        resume_text=SAMPLE_RESUME,
        jd_text=MATCHING_JD,
        skill_overlap=0.85,
        keyword_overlap=0.62,
    )
    vec = res["feature_vector"]
    assert isinstance(vec, list), f"Expected list, got {type(vec)}"
    assert len(vec) == 3, f"Expected exactly 3 elements in feature_vector, got {len(vec)}"


def test_3_semantic_similarity_matches_cosine_similarity():
    """3. semantic_similarity matches cosine_similarity(resume_text, jd_text)."""
    expected_sim = cosine_similarity(SAMPLE_RESUME, MATCHING_JD)
    res = build_matching_feature_vector(
        resume_text=SAMPLE_RESUME,
        jd_text=MATCHING_JD,
        skill_overlap=0.85,
        keyword_overlap=0.62,
    )
    assert math.isclose(res["semantic_similarity"], expected_sim, rel_tol=1e-5), (
        f"semantic_similarity {res['semantic_similarity']} != cosine_similarity {expected_sim}"
    )
    assert math.isclose(res["feature_vector"][0], expected_sim, rel_tol=1e-5), (
        f"feature_vector[0] {res['feature_vector'][0]} != cosine_similarity {expected_sim}"
    )


def test_4_skill_overlap_preserved():
    """4. skill_overlap is preserved correctly (including string/int conversions)."""
    res1 = build_matching_feature_vector(SAMPLE_RESUME, MATCHING_JD, 0.75, 0.40)
    assert res1["skill_overlap"] == 0.75, f"Expected 0.75, got {res1['skill_overlap']}"
    assert res1["feature_vector"][1] == 0.75, f"Expected 0.75 in vector[1], got {res1['feature_vector'][1]}"

    # String conversion
    res2 = build_matching_feature_vector(SAMPLE_RESUME, MATCHING_JD, "0.90", 0.40)
    assert res2["skill_overlap"] == 0.90, f"Expected 0.90, got {res2['skill_overlap']}"
    assert res2["feature_vector"][1] == 0.90, f"Expected 0.90 in vector[1], got {res2['feature_vector'][1]}"

    # Integer conversion
    res3 = build_matching_feature_vector(SAMPLE_RESUME, MATCHING_JD, 1, 0.40)
    assert res3["skill_overlap"] == 1.0, f"Expected 1.0, got {res3['skill_overlap']}"
    assert res3["feature_vector"][1] == 1.0, f"Expected 1.0 in vector[1], got {res3['feature_vector'][1]}"


def test_5_keyword_overlap_preserved():
    """5. keyword_overlap is preserved correctly (including string/int conversions)."""
    res1 = build_matching_feature_vector(SAMPLE_RESUME, MATCHING_JD, 0.80, 0.45)
    assert res1["keyword_overlap"] == 0.45, f"Expected 0.45, got {res1['keyword_overlap']}"
    assert res1["feature_vector"][2] == 0.45, f"Expected 0.45 in vector[2], got {res1['feature_vector'][2]}"

    # String conversion
    res2 = build_matching_feature_vector(SAMPLE_RESUME, MATCHING_JD, 0.80, "0.55")
    assert res2["keyword_overlap"] == 0.55, f"Expected 0.55, got {res2['keyword_overlap']}"
    assert res2["feature_vector"][2] == 0.55, f"Expected 0.55 in vector[2], got {res2['feature_vector'][2]}"

    # None fallback
    res3 = build_matching_feature_vector(SAMPLE_RESUME, MATCHING_JD, 0.80, None)
    assert res3["keyword_overlap"] == 0.0, f"Expected 0.0 for None, got {res3['keyword_overlap']}"
    assert res3["feature_vector"][2] == 0.0, f"Expected 0.0 in vector[2], got {res3['feature_vector'][2]}"


def test_6_empty_resume_text_handled_safely():
    """6. Empty resume text is handled safely (empty string and None)."""
    # Empty string
    res_empty = build_matching_feature_vector("", MATCHING_JD, 0.5, 0.3)
    assert res_empty["semantic_similarity"] == 0.0, (
        f"Expected 0.0 for empty resume_text, got {res_empty['semantic_similarity']}"
    )
    assert res_empty["feature_vector"][0] == 0.0
    assert len(res_empty["feature_vector"]) == 3

    # None
    res_none = build_matching_feature_vector(None, MATCHING_JD, 0.5, 0.3)
    assert res_none["semantic_similarity"] == 0.0, (
        f"Expected 0.0 for None resume_text, got {res_none['semantic_similarity']}"
    )
    assert res_none["feature_vector"][0] == 0.0
    assert len(res_none["feature_vector"]) == 3


def test_7_empty_jd_text_handled_safely():
    """7. Empty JD text is handled safely (empty string and None)."""
    # Empty string
    res_empty = build_matching_feature_vector(SAMPLE_RESUME, "", 0.5, 0.3)
    assert res_empty["semantic_similarity"] == 0.0, (
        f"Expected 0.0 for empty jd_text, got {res_empty['semantic_similarity']}"
    )
    assert res_empty["feature_vector"][0] == 0.0
    assert len(res_empty["feature_vector"]) == 3

    # None
    res_none = build_matching_feature_vector(SAMPLE_RESUME, None, 0.5, 0.3)
    assert res_none["semantic_similarity"] == 0.0, (
        f"Expected 0.0 for None jd_text, got {res_none['semantic_similarity']}"
    )
    assert res_none["feature_vector"][0] == 0.0
    assert len(res_none["feature_vector"]) == 3


def test_8_values_in_feature_vector_are_numeric():
    """8. Values in feature_vector are numeric."""
    res = build_matching_feature_vector(
        resume_text=SAMPLE_RESUME,
        jd_text=MATCHING_JD,
        skill_overlap=0.75,
        keyword_overlap=0.50,
    )
    vec = res["feature_vector"]
    for idx, val in enumerate(vec):
        assert isinstance(val, (float, int)), f"Element {idx} ({val}) is not float/int, got {type(val)}"
        assert not math.isnan(val), f"Element {idx} is NaN"
        assert not math.isinf(val), f"Element {idx} is infinite"


def test_9_different_texts_produce_different_similarities():
    """9. Different resume/JD texts produce different semantic similarity values."""
    res_matching = build_matching_feature_vector(
        resume_text=SAMPLE_RESUME,
        jd_text=MATCHING_JD,
        skill_overlap=0.8,
        keyword_overlap=0.6,
    )
    res_unrelated = build_matching_feature_vector(
        resume_text=SAMPLE_RESUME,
        jd_text=UNRELATED_JD,
        skill_overlap=0.0,
        keyword_overlap=0.0,
    )
    sim_match = res_matching["semantic_similarity"]
    sim_unrelated = res_unrelated["semantic_similarity"]

    assert sim_match != sim_unrelated, (
        f"Expected different similarities, got {sim_match} and {sim_unrelated}"
    )
    assert sim_match > sim_unrelated, (
        f"Matching JD similarity ({sim_match:.4f}) should exceed unrelated JD ({sim_unrelated:.4f})"
    )


# ---------------------------------------------------------------------------
# Main Execution
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("\n=== Running Feature 4C: Matching Feature Vector Tests ===\n")

    test("1. Valid resume/JD returns all expected keys", test_1_expected_keys)
    test("2. feature_vector contains exactly 3 values", test_2_feature_vector_length)
    test("3. semantic_similarity matches cosine_similarity(resume_text, jd_text)", test_3_semantic_similarity_matches_cosine_similarity)
    test("4. skill_overlap is preserved correctly", test_4_skill_overlap_preserved)
    test("5. keyword_overlap is preserved correctly", test_5_keyword_overlap_preserved)
    test("6. Empty resume text is handled safely", test_6_empty_resume_text_handled_safely)
    test("7. Empty JD text is handled safely", test_7_empty_jd_text_handled_safely)
    test("8. Values in feature_vector are numeric", test_8_values_in_feature_vector_are_numeric)
    test("9. Different resume/JD texts produce different semantic similarity values", test_9_different_texts_produce_different_similarities)

    # Example demonstration
    sample_res = build_matching_feature_vector(
        resume_text=SAMPLE_RESUME,
        jd_text=MATCHING_JD,
        skill_overlap=0.8571,
        keyword_overlap=0.4520,
    )

    print("\n=== Example Feature Vector Output ===")
    print(f"semantic_similarity : {sample_res['semantic_similarity']:.4f}")
    print(f"skill_overlap       : {sample_res['skill_overlap']:.4f}")
    print(f"keyword_overlap     : {sample_res['keyword_overlap']:.4f}")
    print(f"feature_vector      : {sample_res['feature_vector']}")

    print("\n=======================================================")
    print(f"Results: {passed} passed, {failed} failed")
    print("=======================================================\n")

    if failed > 0:
        sys.exit(1)
    sys.exit(0)
