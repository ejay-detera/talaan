# Talaan 30-Page Evaluation Report

> **Provenance Watermark:** `DRY RUN — AUXILIARY DEV BACKUP (NOT MUSE GLIMMER) [provider=gemini, model=gemini-3.5-flash-lite]`
> **Model:** `gemini-3.5-flash-lite` (`MODEL_PROVIDER=gemini`)
> **Timestamp:** `2026-10-28T17:58:30.716Z`
> **Dataset Directory:** `eval/pages-30` (2 pages evaluated)

## Summary Metrics

| Metric | Result | Target (PRD §4) |
| --- | --- | --- |
| **Customer Name Accuracy** | **100.0%** | >= 85% |
| **Item Description Accuracy** | **100.0%** | >= 80% |
| **Peso Amount Accuracy (Centavo-Exact)** | **100.0%** | >= 90% |
| **Exact Row Match Rate** | **100.0%** | >= 80% |
| **Written Total Match Rate** | **100.0%** | >= 85% |
| **Computed Total Match Rate** | **100.0%** | >= 90% |
| **Unreadable Page Detection** | **100.0%** | 100% |
| **Discrepancy Recall (Deterministic Math)** | **100.0%** | **100%** |
| **Discrepancy Precision** | **100.0%** | >= 95% |
| **Human Review Flag Rate** | **0.0%** | Reported |
| **Mean Latency** | **16992 ms** | <= 15,000 ms |
| **p50 Latency** | **16574 ms** | <= 10,000 ms |
| **p95 Latency** | **17410 ms** | <= 15,000 ms |

## Per-Page Breakdown

| Page ID | Category | Unreadable OK | Rows (Expected/Extracted) | Exact Row Matches | Discrepancy (TP/FP/FN) | Review Flags | Latency (ms) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `page-01` | clean | ✅ | 4/4 | 4/4 | 0/0/0 | 0 | 17410 |
| `page-02` | clean | ✅ | 4/4 | 4/4 | 0/0/0 | 0 | 16574 |
