from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
DASHBOARD = ROOT / "dashboard"


def clean_records(frame: pd.DataFrame) -> list[dict[str, object]]:
    return json.loads(frame.to_json(orient="records", date_format="iso"))


def build() -> None:
    monthly = pd.read_csv(PROCESSED / "monthly_data.csv")
    periods = pd.read_csv(PROCESSED / "period_summary.csv")
    best_lags = pd.read_csv(PROCESSED / "best_lags.csv")
    correlation_lags = pd.read_csv(PROCESSED / "correlation_lags.csv")
    summary = json.loads((PROCESSED / "analysis_summary.json").read_text(encoding="utf-8"))
    correlation_columns = [
        "hibor_3m_pct",
        "new_applications_received",
        "new_loans_approved_count",
        "approval_to_application_ratio_pct",
        "residential_transactions",
        "negative_equity_count",
        "unemployment_rate_pct",
        "cpi_yoy_pct",
    ]
    correlations = monthly[correlation_columns].corr().round(4)
    payload = {
        "meta": {
            "title": "Hong Kong Housing Mortgage Risk Monitor",
            "sample_start": summary["sample_start"],
            "sample_end": summary["sample_end"],
            "months": summary["months"],
            "generated_from": "HKMA, Land Registry, Census and Statistics Department",
        },
        "monthly": clean_records(monthly),
        "periods": clean_records(periods),
        "bestLags": clean_records(best_lags),
        "lagProfiles": {
            f"{driver}->{outcome}": clean_records(
                correlation_lags[
                    (correlation_lags["driver"] == driver)
                    & (correlation_lags["outcome"] == outcome)
                ].sort_values("lag_months")
            )
            for driver, outcome in [
                ("hibor_3m_pct", "new_applications_received"),
                ("hibor_3m_pct", "new_loans_approved_count"),
                ("hibor_3m_pct", "residential_transactions"),
                ("hibor_3m_pct", "negative_equity_count"),
                ("new_applications_received", "residential_transactions"),
            ]
        },
        "correlationLabels": {
            "hibor_3m_pct": "3M HIBOR",
            "new_applications_received": "Applications",
            "new_loans_approved_count": "Approvals",
            "approval_to_application_ratio_pct": "Approval / application",
            "residential_transactions": "Transactions",
        },
        "correlationMatrix": {
            "labels": [correlations.columns[index] for index in range(len(correlations.columns))],
            "values": correlations.values.tolist(),
        },
        "summary": summary,
        "events": [
            {"period": "2022-03", "label": "Hiking cycle begins"},
            {"period": "2023-08", "label": "HIBOR peak / cycle transition"},
            {"period": "2023-09", "label": "Post-hiking window"},
        ],
    }
    json_text = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    DASHBOARD.mkdir(parents=True, exist_ok=True)
    (DASHBOARD / "data.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    (DASHBOARD / "data.js").write_text(f"window.HK_MORTGAGE_DATA = {json_text};\n", encoding="utf-8")
    print(f"wrote dashboard data with {len(monthly)} monthly rows")


if __name__ == "__main__":
    build()
