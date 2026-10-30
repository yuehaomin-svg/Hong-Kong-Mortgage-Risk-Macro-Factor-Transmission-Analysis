# Hong Kong Mortgage Risk Monitor

### Data analysis portfolio project on interest rates, mortgage activity and housing risk

![Hong Kong Mortgage Risk Monitor dashboard](artifacts/desktop.png)

[Open the interactive dashboard](https://yuehaomin-svg.github.io/Hong-Kong-Mortgage-Risk-Macro-Factor-Transmission-Analysis/dashboard/) · [Chinese report](docs/report-cn.md) · [English report](docs/report-en.md) · [Methodology](docs/methodology.md)

> GitHub Pages is not enabled automatically. Follow the steps below once before sharing the interactive dashboard link.

## Project Overview

This project examines how the Hong Kong interest-rate hiking cycle coincided with changes in residential mortgage demand, approvals, transactions and negative-equity risk from January 2018 to December 2025.

It combines a reproducible Python data pipeline, mixed-frequency exploratory analysis, a transparent composite stress index and a bilingual interactive dashboard. The presentation focuses on analytical evidence, business interpretation and visual communication.

## Key Findings

- Mortgage applications fell **25.3%** during the hiking window, while approvals declined **17.8%** and residential transactions declined **24.3%**.
- The composite mortgage stress index peaked at **58.7/100 in July 2024**; alternative weighting schemes produced peaks of 58.7–60.7, supporting the timing result.
- Three-month HIBOR and mortgage applications moved in opposite directions, with a descriptive correlation of **-0.70**.
- Applications and residential transactions were most closely related at zero lag (**r = 0.67**), indicating a largely synchronous market cycle rather than a stable one-way lead.
- Negative equity appeared later: HIBOR led the strongest negative-equity relationship by **12 months (r = 0.85)**, although common trends and quarterly sampling limit causal interpretation.

## Portfolio Highlights

| Analytical focus | What the dashboard shows |
| --- | --- |
| Market cycle segmentation | Pre-hiking, hiking and post-hiking comparisons |
| Composite risk measurement | Stress-index construction and three weighting scenarios |
| Relationship analysis | Correlation heatmap and lead-lag diagnostics |
| Business translation | Executive KPI cards, structured findings and limitations |
| Communication | Responsive Chinese-English interface and reproducible documentation |

<details>
<summary><strong>Mobile dashboard preview</strong></summary>

![Mobile dashboard preview](artifacts/mobile.png)

</details>

## Data Sources

| Domain | Official source | Frequency |
| --- | --- | --- |
| Mortgage applications, approvals and LTV | HKMA Residential Mortgage Survey | Monthly |
| Negative equity | HKMA Mortgage Loans in Negative Equity Survey | Quarterly |
| Interest rates | HKMA Hong Kong Dollar Interest Settlement Rates | Monthly average |
| Residential transactions | Hong Kong Land Registry | Monthly |
| Unemployment | Census and Statistics Department | Rolling three-month |
| Inflation | Census and Statistics Department | Monthly year-on-year |

## Analytical Workflow

1. Download fixed snapshots from official open-data sources.
2. Harmonise monthly, rolling-quarterly and quarterly observations.
3. Build application, approval, transaction, rate, negative-equity and macroeconomic indicators.
4. Calculate a four-component mortgage stress index and test alternative weights.
5. Run descriptive correlation and lead-lag analysis with explicit limitations.
6. Publish the evidence through an interactive bilingual dashboard.

## Reproduce the Project

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt

python scripts/download_data.py
python scripts/build_dataset.py
python scripts/build_dashboard_data.py
python -m pytest -q
```

Open `dashboard/index.html` directly, or serve the repository locally:

```powershell
python -m http.server 8000
```

Then visit `http://127.0.0.1:8000/dashboard/`.

## Enable GitHub Pages

1. Open the repository **Settings**.
2. Select **Pages** in the left sidebar.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` and `/ (root)`, then click **Save**.
5. Wait one to two minutes and refresh:
   `https://yuehaomin-svg.github.io/Hong-Kong-Mortgage-Risk-Macro-Factor-Transmission-Analysis/dashboard/`

## Repository Structure

```text
dashboard/             interactive bilingual dashboard
artifacts/             desktop and mobile dashboard previews
data/raw/              official source snapshots, excluded from Git
data/processed/        generated analysis datasets, excluded from Git
docs/                  reports, methodology, data dictionary and portfolio notes
scripts/               data download and reproducible transformation pipeline
tests/                 pipeline and visual regression checks
```

The dashboard payload is included in the repository so the visual portfolio works immediately on GitHub Pages. Raw and processed source files remain excluded to keep the repository compact and can be regenerated with the scripts above.

## Important Limitations

- The stress index is a relative monitoring gauge, not a credit-risk probability or investment signal.
- Monthly observations provide a limited sample for statistical inference.
- Negative-equity data is quarterly and common time trends may inflate correlation estimates.
- Approvals divided by applications is a market-level proxy, not a cohort-level approval probability.
- Correlation and lead-lag results are descriptive and should not be interpreted as causal estimates.

## About This Portfolio Version

This academic team project is presented as a data-analysis portfolio case study. The public dashboard intentionally omits personal member details. When using the project in a job application, add a short and truthful statement of your own contribution.

For interview preparation, see [portfolio-notes.md](docs/portfolio-notes.md).
