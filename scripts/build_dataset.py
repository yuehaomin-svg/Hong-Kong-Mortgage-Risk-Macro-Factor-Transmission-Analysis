from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed"
MONTHS = {
    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12,
    "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "Jun": 6, "Jul": 7, "Aug": 8,
    "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
}


def numeric(value: object) -> float:
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return np.nan
    if isinstance(value, str) and value.strip() in {"", "N.A.", "*", "-"}:
        return np.nan
    try:
        return float(str(value).replace(",", "").replace("%", ""))
    except ValueError:
        return np.nan


def period_key(year: int, month: int) -> str:
    return f"{year:04d}-{month:02d}"


def read_mortgage() -> pd.DataFrame:
    sheet = pd.read_excel(RAW / "hkma_T0307.xlsx", sheet_name="T3.7", header=None)
    records: list[dict[str, object]] = []
    year = None
    for _, row in sheet.iloc[16:].iterrows():
        if pd.notna(row.iloc[0]):
            try:
                year = int(row.iloc[0])
            except (TypeError, ValueError):
                continue
        month = MONTHS.get(str(row.iloc[1]).strip())
        if not year or month is None or year < 2018 or year > 2025:
            continue
        records.append(
            {
                "period": period_key(year, month),
                "outstanding_loans_hkd_mn": numeric(row.iloc[3]),
                "new_applications_received": numeric(row.iloc[19]),
                "new_loans_drawn_hkd_mn": numeric(row.iloc[22]),
                "new_loans_drawn_count": numeric(row.iloc[25]),
                "new_loans_approved_hkd_mn": numeric(row.iloc[28]),
                "new_loans_approved_count": numeric(row.iloc[31]),
                "average_approved_loan_hkd_mn": numeric(row.iloc[33]),
                "loan_to_value_ratio_pct": numeric(row.iloc[34]),
                "contractual_life_months": numeric(row.iloc[35]),
                "approved_not_yet_drawn_hkd_mn": numeric(row.iloc[47]),
                "approved_not_yet_drawn_count": numeric(row.iloc[48]),
                "new_loan_rate_hibor_pct": numeric(row.iloc[50]),
                "new_loan_rate_blr_pct": numeric(row.iloc[51]),
                "new_loan_rate_fixed_pct": numeric(row.iloc[52]),
            }
        )
    return pd.DataFrame(records).drop_duplicates("period").sort_values("period")


def read_hibor() -> pd.DataFrame:
    sheet = pd.read_excel(RAW / "hkma_T060302.xls", sheet_name="T6.3.2 (HIBOR Fixing)", header=None)
    records: list[dict[str, object]] = []
    year = None
    for _, row in sheet.iloc[11:].iterrows():
        if pd.notna(row.iloc[0]):
            try:
                year = int(row.iloc[0])
            except (TypeError, ValueError):
                continue
        month = MONTHS.get(str(row.iloc[1]).strip())
        if not year or month is None or year < 2018 or year > 2025:
            continue
        records.append(
            {
                "period": period_key(year, month),
                "hibor_overnight_pct": numeric(row.iloc[4]),
                "hibor_1m_pct": numeric(row.iloc[6]),
                "hibor_3m_pct": numeric(row.iloc[7]),
                "hibor_12m_pct": numeric(row.iloc[10]),
            }
        )
    return pd.DataFrame(records).drop_duplicates("period").sort_values("period")


def read_negative_equity() -> pd.DataFrame:
    sheet = pd.read_excel(RAW / "hkma_T0316.xlsx", sheet_name="T3.16", header=None)
    records: list[dict[str, object]] = []
    year = None
    for _, row in sheet.iloc[9:].iterrows():
        if pd.notna(row.iloc[0]):
            try:
                year = int(row.iloc[0])
            except (TypeError, ValueError):
                continue
        quarter = str(row.iloc[1]).strip()
        if not year or quarter not in {"Q1", "Q2", "Q3", "Q4"}:
            continue
        quarter_number = int(quarter[1])
        period_end = pd.Period(f"{year}Q{quarter_number}").end_time.date().isoformat()
        records.append(
            {
                "period_end": period_end,
                "negative_equity_count": numeric(row.iloc[3]),
                "negative_equity_pct_of_borrowers": numeric(row.iloc[4]),
                "negative_equity_outstanding_hkd_mn": numeric(row.iloc[6]),
                "negative_equity_pct_of_outstanding": numeric(row.iloc[7]),
                "negative_equity_unsecured_hkd_mn": numeric(row.iloc[8]),
                "negative_equity_ltv_ratio": numeric(row.iloc[9]),
            }
        )
    return pd.DataFrame(records).drop_duplicates("period_end").sort_values("period_end")


def read_unemployment() -> pd.DataFrame:
    rows = json.loads((RAW / "unemployment.json").read_text(encoding="utf-8-sig"))["dataSet"]
    records = []
    for row in rows:
        if (
            row.get("AGEDesc") == "Total"
            and row.get("SEXDesc") == "Total"
            and row.get("freq") == "M3M"
            and row.get("sv") == "UR"
        ):
            value = numeric(row.get("figure"))
            if pd.notna(value):
                period = str(row["period"])
                records.append({"period": f"{period[:4]}-{period[4:]}", "unemployment_rate_pct": value})
    return pd.DataFrame(records).drop_duplicates("period").sort_values("period")


def read_cpi() -> pd.DataFrame:
    rows = json.loads((RAW / "cpi_sections.json").read_text(encoding="utf-8-sig"))["dataSet"]
    records = []
    for row in rows:
        if (
            row.get("GROUPDesc") == "Total"
            and row.get("sv") == "CC_CM_1920"
            and row.get("svDesc") == "Year-on-year % change"
        ):
            value = numeric(row.get("figure"))
            if pd.notna(value):
                period = str(row["period"])
                records.append({"period": f"{period[:4]}-{period[4:]}", "cpi_yoy_pct": value})
    return pd.DataFrame(records).drop_duplicates("period").sort_values("period")


def read_land_registry() -> pd.DataFrame:
    records = []
    for path in sorted(RAW.glob("landreg_*.json")):
        period = path.stem.removeprefix("landreg_")
        rows = json.loads(path.read_text(encoding="utf-8-sig"))
        selected = {
            row.get("Description"): row
            for row in rows
            if row.get("Description") in {
                "Number of ASP for Residential Building Units",
                "Number of Primary Sales for ASP Residential Building Units",
                "Number of Secondary Sales for ASP Residential Building Units",
            }
        }
        residential = selected.get("Number of ASP for Residential Building Units", {})
        primary = selected.get("Number of Primary Sales for ASP Residential Building Units", {})
        secondary = selected.get("Number of Secondary Sales for ASP Residential Building Units", {})
        records.append(
            {
                "period": f"{period[:4]}-{period[4:]}",
                "residential_transactions": numeric(residential.get("Units")),
                "residential_transaction_value_hkd_mn": numeric(residential.get("Consideration (nearest $ million)")),
                "primary_sales": numeric(primary.get("Units")),
                "secondary_sales": numeric(secondary.get("Units")),
            }
        )
    return pd.DataFrame(records).drop_duplicates("period").sort_values("period")


def zscore(series: pd.Series) -> pd.Series:
    return (series - series.mean()) / series.std(ddof=0)


def build() -> None:
    PROCESSED.mkdir(parents=True, exist_ok=True)
    base = (
        pd.date_range("2018-01-01", "2025-12-01", freq="MS")
        .to_period("M")
        .astype(str)
        .to_frame(index=False, name="period")
    )
    merged = base
    for frame in [read_mortgage(), read_hibor(), read_unemployment(), read_cpi(), read_land_registry()]:
        merged = merged.merge(frame, on="period", how="left")

    neg_equity = read_negative_equity()
    neg_equity["period"] = pd.PeriodIndex(neg_equity.pop("period_end"), freq="Q").asfreq("M").astype(str)
    merged = merged.merge(neg_equity, on="period", how="left")
    merged["negative_equity_is_quarter_end"] = merged["negative_equity_count"].notna()
    neg_columns = [
        column
        for column in merged
        if column.startswith("negative_equity_") and column != "negative_equity_is_quarter_end"
    ]
    merged[neg_columns] = merged[neg_columns].ffill()

    merged["approval_to_application_ratio_pct"] = (
        100 * merged["new_loans_approved_count"] / merged["new_applications_received"]
    )
    merged["residential_transactions_yoy_pct"] = merged["residential_transactions"].pct_change(12) * 100
    merged["residential_transactions_3m_pct"] = merged["residential_transactions"].pct_change(3) * 100
    merged["residential_transactions_6m_pct"] = merged["residential_transactions"].pct_change(6) * 100
    merged["new_applications_yoy_pct"] = merged["new_applications_received"].pct_change(12) * 100
    merged["hibor_3m_change_pp"] = merged["hibor_3m_pct"].diff()

    components = {
        "z_interest_rate": zscore(merged["hibor_3m_pct"]),
        "z_negative_equity": zscore(merged["negative_equity_count"]),
        "z_transaction_drop": zscore(-merged["residential_transactions_3m_pct"]),
        "z_unemployment": zscore(merged["unemployment_rate_pct"]),
    }
    for name, values in components.items():
        merged[name] = values
    weight_sets = {
        "equal": {
            "z_interest_rate": 0.25,
            "z_negative_equity": 0.25,
            "z_transaction_drop": 0.25,
            "z_unemployment": 0.25,
        },
        "rate_dominant": {
            "z_interest_rate": 0.35,
            "z_negative_equity": 0.30,
            "z_transaction_drop": 0.20,
            "z_unemployment": 0.15,
        },
        "borrower_dominant": {
            "z_interest_rate": 0.25,
            "z_negative_equity": 0.35,
            "z_transaction_drop": 0.20,
            "z_unemployment": 0.20,
        },
    }
    for name, weights in weight_sets.items():
        stress_z = sum(merged[component] * weight for component, weight in weights.items())
        merged[f"stress_z_{name}"] = stress_z
        merged[f"stress_index_{name}"] = (50 + 10 * stress_z).clip(0, 100)

    merged["cycle_period"] = np.select(
        [merged["period"] <= "2022-02", merged["period"] <= "2023-08"],
        ["pre_hiking", "hiking"],
        default="post_hiking",
    )
    merged.to_csv(PROCESSED / "monthly_data.csv", index=False, float_format="%.6f")
    neg_equity.to_csv(PROCESSED / "quarterly_negative_equity.csv", index=False, float_format="%.6f")

    period_summary = merged.groupby("cycle_period", sort=False).agg(
        months=("period", "count"),
        hibor_3m_pct=("hibor_3m_pct", "mean"),
        new_applications_received=("new_applications_received", "mean"),
        new_loans_approved_count=("new_loans_approved_count", "mean"),
        approval_to_application_ratio_pct=("approval_to_application_ratio_pct", "mean"),
        residential_transactions=("residential_transactions", "mean"),
        residential_transactions_yoy_pct=("residential_transactions_yoy_pct", "mean"),
        unemployment_rate_pct=("unemployment_rate_pct", "mean"),
        negative_equity_count=("negative_equity_count", "mean"),
        stress_index_equal=("stress_index_equal", "mean"),
    ).reset_index()
    period_summary.to_csv(PROCESSED / "period_summary.csv", index=False, float_format="%.6f")

    lag_rows = []
    driver_outcome_pairs = [
        ("hibor_3m_pct", "new_applications_received"),
        ("hibor_3m_pct", "new_loans_approved_count"),
        ("hibor_3m_pct", "residential_transactions"),
        ("hibor_3m_pct", "negative_equity_count"),
        ("hibor_3m_pct", "approval_to_application_ratio_pct"),
        ("hibor_3m_change_pp", "new_applications_received"),
        ("hibor_3m_change_pp", "new_loans_approved_count"),
        ("hibor_3m_change_pp", "residential_transactions"),
        ("hibor_3m_change_pp", "negative_equity_count"),
        ("hibor_3m_change_pp", "approval_to_application_ratio_pct"),
        ("new_applications_received", "residential_transactions"),
        ("residential_transactions", "new_applications_received"),
        ("new_loans_approved_count", "residential_transactions"),
        ("residential_transactions", "new_loans_approved_count"),
    ]
    for driver, outcome in driver_outcome_pairs:
        for lag in range(-12, 13):
            correlation = merged[driver].shift(lag).corr(merged[outcome])
            lag_rows.append(
                {
                    "driver": driver,
                    "outcome": outcome,
                    "lag_months": lag,
                    "correlation": correlation,
                }
            )
    lag_frame = pd.DataFrame(lag_rows)
    lag_frame.to_csv(PROCESSED / "correlation_lags.csv", index=False, float_format="%.6f")
    best_lags = (
        lag_frame.assign(abs_correlation=lambda frame: frame["correlation"].abs())
        .sort_values(["driver", "outcome", "abs_correlation"], ascending=[True, True, False])
        .groupby(["driver", "outcome"], as_index=False)
        .first()[["driver", "outcome", "lag_months", "correlation"]]
    )
    best_lags.to_csv(PROCESSED / "best_lags.csv", index=False, float_format="%.6f")

    peak = merged.loc[merged["stress_index_equal"].idxmax()]
    summary = {
        "sample_start": str(merged["period"].min()),
        "sample_end": str(merged["period"].max()),
        "months": int(len(merged)),
        "cycle_periods": {
            "pre_hiking": {"start": "2018-01", "end": "2022-02", "label": "Pre-hiking"},
            "hiking": {"start": "2022-03", "end": "2023-08", "label": "Hiking cycle"},
            "post_hiking": {"start": "2023-09", "end": "2025-12", "label": "Post-hiking"},
        },
        "stress_peak": {
            "period": str(peak["period"]),
            "index_equal": float(peak["stress_index_equal"]),
            "index_rate_dominant": float(peak["stress_index_rate_dominant"]),
            "index_borrower_dominant": float(peak["stress_index_borrower_dominant"]),
        },
        "stress_weights": weight_sets,
        "period_summary": period_summary.to_dict(orient="records"),
        "best_lags": best_lags.to_dict(orient="records"),
        "data_quality": {
            "missing_by_column": {
                column: int(value)
                for column, value in merged.isna().sum().items()
                if value
            },
            "negative_equity_monthly_values_forward_filled": True,
        },
    }
    (PROCESSED / "analysis_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"wrote {len(merged)} monthly rows to {PROCESSED}")


if __name__ == "__main__":
    build()
