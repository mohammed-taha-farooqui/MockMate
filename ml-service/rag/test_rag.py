"""
test_rag.py
===========
Unit and integration tests for Local RAG Retrieval (ml-service/rag/rag_service.py).

Tests:
  1. Relevant JavaScript query retrieves JavaScript content (source: javascript.md)
  2. Relevant React query retrieves React content (source: react.md)
  3. top_k parameter is respected
  4. Empty/whitespace query is handled safely (returns [])
  5. Index can be built and re-loaded cleanly from disk
  6. Returned results contain 'source', 'text', and numeric 'score'
  7. Retrieval is deterministic for identical queries

Run:
    python ml-service/rag/test_rag.py
  or (from inside ml-service/rag/):
    python test_rag.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# Path setup to allow running from root or ml-service/ or ml-service/rag/
_CURR_DIR = Path(__file__).resolve().parent
_ML_SERVICE_DIR = _CURR_DIR.parent
if str(_ML_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(_ML_SERVICE_DIR))

from rag.rag_service import build_index, retrieve_context  # noqa: E402

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
# Test Functions
# ---------------------------------------------------------------------------

def test_1_javascript_query_retrieves_javascript_content():
    """1. Relevant JavaScript query retrieves JavaScript content."""
    query = "Event loop microtask macrotask closure scope"
    results = retrieve_context(query, top_k=3)
    assert len(results) > 0, "Expected non-empty results for JavaScript query"
    top_source = results[0]["source"]
    assert top_source == "javascript.md", (
        f"Expected top source 'javascript.md', got '{top_source}'"
    )
    assert "text" in results[0]
    assert len(results[0]["text"]) > 0


def test_2_react_query_retrieves_react_content():
    """2. Relevant React query retrieves React content."""
    query = "Virtual DOM reconciliation diffing algorithm useState useEffect"
    results = retrieve_context(query, top_k=3)
    assert len(results) > 0, "Expected non-empty results for React query"
    top_source = results[0]["source"]
    assert top_source == "react.md", (
        f"Expected top source 'react.md', got '{top_source}'"
    )


def test_3_top_k_is_respected():
    """3. top_k parameter is respected."""
    res1 = retrieve_context("database query index MongoDB", top_k=1)
    assert len(res1) == 1, f"Expected 1 item for top_k=1, got {len(res1)}"

    res2 = retrieve_context("database query index MongoDB", top_k=5)
    assert len(res2) == 5, f"Expected 5 items for top_k=5, got {len(res2)}"


def test_4_empty_query_handled_safely():
    """4. Empty or whitespace query is handled safely (returns [])."""
    assert retrieve_context("") == [], "Expected [] for empty string"
    assert retrieve_context("   ") == [], "Expected [] for whitespace string"
    assert retrieve_context(None) == [], "Expected [] for None"


def test_5_index_build_and_load():
    """5. Index can be built and loaded cleanly."""
    index, metadata = build_index(force_rebuild=True)
    assert index is not None, "Index should not be None after build"
    assert index.ntotal > 0, "Index ntotal should be > 0"
    assert len(metadata) == index.ntotal, "Metadata count should match index ntotal"

    # Test loading existing index
    index_loaded, metadata_loaded = build_index(force_rebuild=False)
    assert index_loaded.ntotal == index.ntotal, "Loaded index total mismatch"


def test_6_returned_structure_and_score():
    """6. Returned results contain source, text, and numeric score."""
    results = retrieve_context("Python Memory Management GIL", top_k=2)
    assert len(results) > 0
    for item in results:
        assert "source" in item, "Missing 'source' key"
        assert "text" in item, "Missing 'text' key"
        assert "score" in item, "Missing 'score' key"
        assert isinstance(item["score"], (int, float)), f"Score is not float/int: {item['score']}"
        assert 0.0 <= item["score"] <= 1.0, f"Score out of range [0, 1]: {item['score']}"


def test_7_retrieval_is_deterministic():
    """7. Retrieval is deterministic for identical queries."""
    query = "REST API idempotency status codes"
    res_a = retrieve_context(query, top_k=3)
    res_b = retrieve_context(query, top_k=3)

    assert len(res_a) == len(res_b)
    for a, b in zip(res_a, res_b):
        assert a["source"] == b["source"], f"Source mismatch: {a['source']} vs {b['source']}"
        assert a["text"] == b["text"], "Text content mismatch"
        assert a["score"] == b["score"], f"Score mismatch: {a['score']} vs {b['score']}"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("\n=== Local RAG Retrieval Service Tests (FAISS + Sentence Transformers) ===\n")

    test("1. Relevant JavaScript query retrieves JavaScript content", test_1_javascript_query_retrieves_javascript_content)
    test("2. Relevant React query retrieves React content", test_2_react_query_retrieves_react_content)
    test("3. top_k parameter is respected", test_3_top_k_is_respected)
    test("4. Empty/whitespace query is handled safely", test_4_empty_query_handled_safely)
    test("5. Index can be built and loaded cleanly", test_5_index_build_and_load)
    test("6. Returned results contain source, text, and score", test_6_returned_structure_and_score)
    test("7. Retrieval is deterministic for identical queries", test_7_retrieval_is_deterministic)

    print("\n--- Example Query & Retrieved Sources ---")
    sample_query = "React hooks useState useEffect state management"
    retrieved = retrieve_context(sample_query, top_k=3)
    print(f"Query: '{sample_query}'")
    for rank, item in enumerate(retrieved, start=1):
        print(f"\n  [{rank}] Source: {item['source']}  (Similarity Score: {item['score']:.4f})")
        print(f"      Text excerpt: {item['text'][:150]}...")

    print("\n===================================================")
    print(f"Results: {passed} passed, {failed} failed out of {passed + failed} tests")
    print("===================================================\n")

    sys.exit(0 if failed == 0 else 1)
