"""
test_api.py
===========
Feature 4D – API integration tests for the MockMate ML Inference Service.

Tests:
  1. GET /health returns HTTP 200
  2. POST /predict returns HTTP 200
  3. matchScore exists in response
  4. fitClass is a valid label (No Fit | Potential Fit | Good Fit)
  5. All six features exist in response
  6. matchScore is between 0 and 100
  7. Empty resume_text is rejected (422)
  8. Empty job_description is rejected (422)
  9. Missing resume_text is rejected (422)
 10. All feature values are numeric (float/int)

Run (server must be running on localhost:8000):
    python test_api.py

Or start the server inline before testing:
    uvicorn app:app --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import sys
import time
import json

try:
    import requests
except ImportError:
    print("[ERROR] 'requests' package is required. Install with: pip install requests")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
BASE_URL = "http://localhost:8000"
VALID_FIT_CLASSES = {"No Fit", "Potential Fit", "Good Fit"}
REQUIRED_FEATURES = {
    "semantic_similarity",
    "skill_overlap",
    "keyword_overlap",
    "experience_match",
    "education_match",
    "role_match",
}

SAMPLE_RESUME = (
    "Senior Full Stack Software Engineer with 5 years of experience in JavaScript, "
    "TypeScript, React, Node.js, Express, MongoDB, and AWS cloud deployments. "
    "Bachelor's degree in Computer Science. Built scalable REST APIs and microservices. "
    "Strong teamwork, communication, and leadership skills."
)

SAMPLE_JD = (
    "Looking for a Senior Full Stack Engineer proficient in React, Node.js, TypeScript, "
    "and AWS cloud infrastructure. 4+ years of experience required. "
    "Bachelor's degree in Computer Science or equivalent preferred. "
    "Must have experience building scalable web APIs. "
    "Strong collaboration and problem-solving skills required."
)

# ---------------------------------------------------------------------------
# Test harness
# ---------------------------------------------------------------------------

passed = 0
failed = 0


def test(name: str, fn) -> None:
    global passed, failed
    try:
        fn()
        print(f"  [PASS] {name}")
        passed += 1
    except AssertionError as exc:
        print(f"  [FAIL] {name}")
        print(f"         AssertionError: {exc}")
        failed += 1
    except Exception as exc:
        print(f"  [FAIL] {name}")
        print(f"         Unexpected error ({type(exc).__name__}): {exc}")
        failed += 1


# ---------------------------------------------------------------------------
# Connectivity check
# ---------------------------------------------------------------------------

def _wait_for_server(retries: int = 5, delay: float = 2.0) -> bool:
    """Poll /health until the server is up or retries exhausted."""
    for attempt in range(1, retries + 1):
        try:
            r = requests.get(f"{BASE_URL}/health", timeout=5)
            if r.status_code == 200:
                return True
        except requests.exceptions.ConnectionError:
            pass
        print(f"  Waiting for server (attempt {attempt}/{retries}) ...")
        time.sleep(delay)
    return False


# ---------------------------------------------------------------------------
# Individual test functions
# ---------------------------------------------------------------------------

def test_1_health_returns_200():
    """GET /health returns HTTP 200."""
    r = requests.get(f"{BASE_URL}/health", timeout=10)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"


def test_2_predict_returns_200():
    """POST /predict returns HTTP 200 for a valid request."""
    payload = {"resume_text": SAMPLE_RESUME, "job_description": SAMPLE_JD}
    r = requests.post(f"{BASE_URL}/predict", json=payload, timeout=30)
    assert r.status_code == 200, (
        f"Expected 200, got {r.status_code}. Body: {r.text[:300]}"
    )


def test_3_match_score_exists():
    """matchScore key exists in /predict response."""
    payload = {"resume_text": SAMPLE_RESUME, "job_description": SAMPLE_JD}
    r = requests.post(f"{BASE_URL}/predict", json=payload, timeout=30)
    assert r.status_code == 200
    body = r.json()
    assert "matchScore" in body, f"'matchScore' missing from response: {body}"


def test_4_fit_class_is_valid():
    """fitClass is one of: No Fit, Potential Fit, Good Fit."""
    payload = {"resume_text": SAMPLE_RESUME, "job_description": SAMPLE_JD}
    r = requests.post(f"{BASE_URL}/predict", json=payload, timeout=30)
    assert r.status_code == 200
    body = r.json()
    fit_class = body.get("fitClass", "")
    assert fit_class in VALID_FIT_CLASSES, (
        f"fitClass '{fit_class}' not in {VALID_FIT_CLASSES}"
    )


def test_5_all_six_features_exist():
    """All 6 required features exist in the features dict."""
    payload = {"resume_text": SAMPLE_RESUME, "job_description": SAMPLE_JD}
    r = requests.post(f"{BASE_URL}/predict", json=payload, timeout=30)
    assert r.status_code == 200
    body = r.json()
    features = body.get("features", {})
    missing = REQUIRED_FEATURES - set(features.keys())
    assert not missing, f"Missing features: {missing}. Got: {set(features.keys())}"


def test_6_match_score_between_0_and_100():
    """matchScore is a numeric value between 0 and 100 (inclusive)."""
    payload = {"resume_text": SAMPLE_RESUME, "job_description": SAMPLE_JD}
    r = requests.post(f"{BASE_URL}/predict", json=payload, timeout=30)
    assert r.status_code == 200
    body = r.json()
    score = body.get("matchScore")
    assert score is not None, "matchScore is None"
    assert isinstance(score, (int, float)), f"matchScore is not numeric: {type(score)}"
    assert 0 <= score <= 100, f"matchScore {score} is outside [0, 100]"


def test_7_empty_resume_text_rejected():
    """POST /predict with empty resume_text returns 422."""
    payload = {"resume_text": "   ", "job_description": SAMPLE_JD}
    r = requests.post(f"{BASE_URL}/predict", json=payload, timeout=10)
    assert r.status_code == 422, (
        f"Expected 422 for empty resume_text, got {r.status_code}"
    )


def test_8_empty_job_description_rejected():
    """POST /predict with empty job_description returns 422."""
    payload = {"resume_text": SAMPLE_RESUME, "job_description": ""}
    r = requests.post(f"{BASE_URL}/predict", json=payload, timeout=10)
    assert r.status_code == 422, (
        f"Expected 422 for empty job_description, got {r.status_code}"
    )


def test_9_missing_field_rejected():
    """POST /predict with missing resume_text returns 422."""
    payload = {"job_description": SAMPLE_JD}
    r = requests.post(f"{BASE_URL}/predict", json=payload, timeout=10)
    assert r.status_code == 422, (
        f"Expected 422 for missing resume_text, got {r.status_code}"
    )


def test_10_feature_values_are_numeric():
    """All feature values in the response are numeric (float/int)."""
    payload = {"resume_text": SAMPLE_RESUME, "job_description": SAMPLE_JD}
    r = requests.post(f"{BASE_URL}/predict", json=payload, timeout=30)
    assert r.status_code == 200
    body = r.json()
    features = body.get("features", {})
    for key, val in features.items():
        assert isinstance(val, (int, float)), (
            f"Feature '{key}' has non-numeric value: {val!r} ({type(val).__name__})"
        )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("\n=== MockMate ML Inference Service – API Tests ===\n")

    print(f"  Target: {BASE_URL}")
    print("  Checking server availability ...")

    if not _wait_for_server():
        print(
            "\n[ERROR] Server is not reachable at "
            f"{BASE_URL}. Start it with:\n"
            "        uvicorn app:app --host 0.0.0.0 --port 8000\n"
        )
        sys.exit(1)

    print("  Server is up!\n")

    # Run tests
    test("1. GET /health returns 200", test_1_health_returns_200)
    test("2. POST /predict returns 200", test_2_predict_returns_200)
    test("3. matchScore exists in response", test_3_match_score_exists)
    test("4. fitClass is valid (No Fit | Potential Fit | Good Fit)", test_4_fit_class_is_valid)
    test("5. All six features exist in response", test_5_all_six_features_exist)
    test("6. matchScore is between 0 and 100", test_6_match_score_between_0_and_100)
    test("7. Empty resume_text is rejected (422)", test_7_empty_resume_text_rejected)
    test("8. Empty job_description is rejected (422)", test_8_empty_job_description_rejected)
    test("9. Missing resume_text field is rejected (422)", test_9_missing_field_rejected)
    test("10. All feature values are numeric", test_10_feature_values_are_numeric)

    # Print sample /health and /predict output
    print("\n--- /health response ---")
    try:
        h = requests.get(f"{BASE_URL}/health", timeout=5)
        print(json.dumps(h.json(), indent=2))
    except Exception as exc:
        print(f"Could not fetch /health: {exc}")

    print("\n--- /predict response (sample) ---")
    try:
        p = requests.post(
            f"{BASE_URL}/predict",
            json={"resume_text": SAMPLE_RESUME, "job_description": SAMPLE_JD},
            timeout=30,
        )
        print(json.dumps(p.json(), indent=2))
    except Exception as exc:
        print(f"Could not fetch /predict: {exc}")

    # Summary
    print("\n" + "=" * 51)
    print(f"Results: {passed} passed, {failed} failed out of {passed + failed} tests")
    print("=" * 51 + "\n")

    sys.exit(0 if failed == 0 else 1)
