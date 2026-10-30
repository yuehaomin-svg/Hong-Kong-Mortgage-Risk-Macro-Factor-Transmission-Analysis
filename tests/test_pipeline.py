from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
import pytest


ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
DASHBOARD = ROOT / "dashboard"


def test_monthly_sample_is_complete() -> None:
    frame = pd.read_csv(PROCESSED / "monthly_data.csv")
    assert len(frame) == 96
    assert frame["period"].min() == "2018-01"
    assert frame["period"].max() == "2025-12"
    assert frame["hibor_3m_pct"].notna().sum() == 96
    assert frame["new_applications_received"].notna().sum() == 96
    assert frame["residential_transactions"].notna().sum() == 96


def test_stress_index_is_bounded_and_weighted() -> None:
    frame = pd.read_csv(PROCESSED / "monthly_data.csv")
    index_columns = [
        "stress_index_equal",
        "stress_index_rate_dominant",
        "stress_index_borrower_dominant",
    ]
    for column in index_columns:
        values = frame[column].dropna()
        assert values.between(0, 100).all()
    assert frame[index_columns].nunique().min() > 1
    assert frame["stress_index_equal"].notna().sum() == 93


def test_analysis_summary_matches_processed_data() -> None:
    summary = json.loads((PROCESSED / "analysis_summary.json").read_text(encoding="utf-8"))
    frame = pd.read_csv(PROCESSED / "monthly_data.csv")
    assert summary["months"] == len(frame)
    assert summary["stress_peak"]["period"] == "2024-07"
    assert summary["stress_peak"]["index_equal"] == pytest.approx(
        frame["stress_index_equal"].max(),
        abs=1e-5,
    )


def test_dashboard_payload_is_current() -> None:
    payload = json.loads((DASHBOARD / "data.json").read_text(encoding="utf-8"))
    assert len(payload["monthly"]) == 96
    assert len(payload["periods"]) == 3
    assert len(payload["correlationMatrix"]["labels"]) == 8
    assert (DASHBOARD / "data.js").exists()
