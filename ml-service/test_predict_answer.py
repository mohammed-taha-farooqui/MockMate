"""
test_predict_answer.py
======================
Unit and integration tests for POST /predict-answer endpoint.

Tests:
1. GET /health includes answerModelLoaded: True
2. POST /predict-answer returns 200 with score and 4 feature fields
3. POST /predict-answer rejects empty candidateAnswer with 422
4. Score is properly clamped between 0 and 5
"""

import sys
import unittest
from pathlib import Path

# Add ml-service directory to sys.path
_BASE_DIR = Path(__file__).resolve().parent
if str(_BASE_DIR) not in sys.path:
    sys.path.insert(0, str(_BASE_DIR))

from fastapi.testclient import TestClient
from app import app


class TestPredictAnswerEndpoint(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_1_health_check_includes_answer_model(self):
        """GET /health returns HTTP 200 and answerModelLoaded is True."""
        r = self.client.get("/health")
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertEqual(body["status"], "ok")
        self.assertTrue(body.get("answerModelLoaded"))

    def test_2_predict_answer_valid_request(self):
        """POST /predict-answer returns 200 with score and features."""
        payload = {
            "questionText": "Explain how dependency injection works in Spring Boot and Python.",
            "referenceAnswer": "Dependency injection is an IoC pattern where classes receive dependencies externally.",
            "candidateAnswer": "Dependency injection allows objects to receive their dependencies from an external container in Spring Boot and Python."
        }
        r = self.client.post("/predict-answer", json=payload)
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertIn("score", body)
        self.assertIn("features", body)
        self.assertIsInstance(body["score"], (int, float))
        self.assertGreaterEqual(body["score"], 0.0)
        self.assertLessEqual(body["score"], 5.0)

        feats = body["features"]
        self.assertIn("semanticSimilarity", feats)
        self.assertIn("keywordOverlap", feats)
        self.assertIn("answerLength", feats)
        self.assertIn("technicalKeywordCount", feats)

    def test_3_predict_answer_validation_empty_fields(self):
        """POST /predict-answer with empty candidateAnswer returns HTTP 422."""
        payload = {
            "questionText": "Explain dependency injection.",
            "referenceAnswer": "IoC pattern.",
            "candidateAnswer": "   "
        }
        r = self.client.post("/predict-answer", json=payload)
        self.assertEqual(r.status_code, 422)

    def test_4_predict_answer_score_clamping(self):
        """POST /predict-answer score is bounded within [0, 5]."""
        payload = {
            "questionText": "What is Python?",
            "referenceAnswer": "A high level programming language.",
            "candidateAnswer": "Python is a high level programming language."
        }
        r = self.client.post("/predict-answer", json=payload)
        self.assertEqual(r.status_code, 200)
        score = r.json()["score"]
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 5.0)


if __name__ == "__main__":
    unittest.main()
