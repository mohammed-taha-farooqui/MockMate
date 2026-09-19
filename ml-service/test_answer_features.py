"""
test_answer_features.py
========================
Test suite for Answer Feature Extraction module.

Tests cover:
1. Strongly matching answer
2. Weak/unrelated answer
3. Empty candidate answer
4. Empty reference answer
5. Identical candidate/reference answer
6. Technical keyword detection
7. Feature vector has exactly 4 values
8. Repeated calls give consistent results
"""

import sys
import unittest
from pathlib import Path

# Add ml-service directory to sys.path
_BASE_DIR = Path(__file__).resolve().parent
if str(_BASE_DIR) not in sys.path:
    sys.path.insert(0, str(_BASE_DIR))

from features.answer_features import (
    extract_answer_features,
    extract_answer_feature_vector,
)


class TestAnswerFeatures(unittest.TestCase):

    def setUp(self):
        self.question = "Explain how dependency injection works in Spring Boot and Python."
        self.ref_answer = (
            "Dependency injection is a software design pattern that implements inversion of control (IoC). "
            "In Spring Boot and Python, it allows objects to receive their dependencies from an external source "
            "rather than constructing them directly, improving modularity, testability, and decoupling."
        )

    def test_1_strongly_matching_answer(self):
        """1. Strongly matching answer should yield high semantic similarity and overlap."""
        cand_answer = (
            "Dependency injection is an IoC pattern where classes receive dependencies from an external container "
            "in Python and Spring Boot. It makes code modular and easy to unit test."
        )
        res = extract_answer_features(self.question, self.ref_answer, cand_answer)
        self.assertGreater(res["semantic_similarity"], 0.6)
        self.assertGreater(res["keyword_overlap"], 0.2)
        self.assertGreater(res["answer_length"], 0.3)
        self.assertGreaterEqual(res["technical_keyword_count"], 2)

    def test_2_weak_unrelated_answer(self):
        """2. Weak/unrelated answer should yield low similarity and keyword overlap."""
        cand_answer = "I enjoy going for long walks on the beach and making pasta with tomatoes."
        res = extract_answer_features(self.question, self.ref_answer, cand_answer)
        self.assertLess(res["semantic_similarity"], 0.3)
        self.assertEqual(res["keyword_overlap"], 0.0)
        self.assertEqual(res["technical_keyword_count"], 0)

    def test_3_empty_candidate_answer(self):
        """3. Empty candidate answer should yield 0 for all features safely."""
        for empty_cand in ["", "   ", None]:
            res = extract_answer_features(self.question, self.ref_answer, empty_cand)
            self.assertEqual(res["semantic_similarity"], 0.0)
            self.assertEqual(res["keyword_overlap"], 0.0)
            self.assertEqual(res["answer_length"], 0.0)
            self.assertEqual(res["technical_keyword_count"], 0)

    def test_4_empty_reference_answer(self):
        """4. Empty reference answer should fallback to question_text safely."""
        cand_answer = "Dependency injection provides inversion of control in Python apps."
        res = extract_answer_features(self.question, "", cand_answer)
        # Should fallback to question text for comparison
        self.assertGreater(res["semantic_similarity"], 0.4)
        self.assertGreater(res["answer_length"], 0.0)

    def test_5_identical_candidate_reference_answer(self):
        """5. Identical candidate/reference answer should yield maximal similarity and overlap."""
        res = extract_answer_features(self.question, self.ref_answer, self.ref_answer)
        self.assertGreaterEqual(res["semantic_similarity"], 0.95)
        self.assertEqual(res["keyword_overlap"], 1.0)

    def test_6_technical_keyword_detection(self):
        """6. Technical keyword detection should accurately identify technical terms."""
        cand_answer = "We built a REST API microservices architecture using Python, React, Docker, and PostgreSQL on AWS."
        res = extract_answer_features(self.question, self.ref_answer, cand_answer)
        # Expected keywords: rest api, microservices, python, react, docker, postgresql, aws
        self.assertGreaterEqual(res["technical_keyword_count"], 6)

    def test_7_feature_vector_length(self):
        """7. Feature vector has exactly 4 values."""
        cand_answer = "Python and Spring Boot make modular web applications."
        vec = extract_answer_feature_vector(self.question, self.ref_answer, cand_answer)
        self.assertEqual(len(vec), 4)
        self.assertIsInstance(vec, list)
        for val in vec:
            self.assertIsInstance(val, (int, float))

    def test_8_repeated_calls_consistency(self):
        """8. Repeated calls give consistent, deterministic results."""
        cand_answer = "Using Docker and Kubernetes for container orchestration with Python."
        res1 = extract_answer_features(self.question, self.ref_answer, cand_answer)
        res2 = extract_answer_features(self.question, self.ref_answer, cand_answer)
        self.assertEqual(res1, res2)

        vec1 = extract_answer_feature_vector(self.question, self.ref_answer, cand_answer)
        vec2 = extract_answer_feature_vector(self.question, self.ref_answer, cand_answer)
        self.assertEqual(vec1, vec2)


if __name__ == "__main__":
    unittest.main()
