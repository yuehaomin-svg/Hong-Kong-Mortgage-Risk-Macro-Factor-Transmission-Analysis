# Portfolio Presentation Notes

## Suggested 60-Second Story

This project examines how the interest-rate hiking cycle affected Hong Kong residential mortgage risk. I integrated official HKMA, Land Registry and Census data into a 96-month analytical dataset, built a transparent four-component stress index, tested its weighting sensitivity, and presented the results in a bilingual interactive dashboard.

The key result is not just that rates and mortgage activity moved in opposite directions. The project also tests whether transactions lead or lag mortgage demand, identifies the delayed nature of negative equity, and documents why the evidence cannot be interpreted causally.

## Employer-Relevant Skills

- Data acquisition from official open-data sources
- Excel, JSON and mixed-frequency data integration
- Reproducible Python transformation pipeline
- Time-series exploratory analysis and lead-lag diagnostics
- Transparent index construction and sensitivity analysis
- Interactive data visualization and bilingual technical communication
- Clear documentation of assumptions, limitations and non-causality

## How to Personalize

Do not present the whole group project as individual work. Add a short contribution line after reviewing the final team version, for example:

> Personal contribution: built the data pipeline, implemented the stress-index sensitivity analysis, and developed the interactive portfolio dashboard.

Use only the work you personally completed or substantially contributed to.

## Resume Bullet Examples

- Built a reproducible 96-month Hong Kong mortgage-risk dataset from HKMA, Land Registry and Census & Statistics Department sources, integrating monthly, rolling-quarterly and quarterly frequencies.
- Developed and stress-tested a transparent composite housing-mortgage index across three weighting schemes, then translated the findings into an interactive bilingual portfolio dashboard.
- Analyzed lead-lag relationships between interest rates, mortgage applications, approvals, transactions and negative equity, with explicit controls against causal overstatement.

## What to Link

- Live dashboard or GitHub Pages URL
- `README.md`
- `docs/report-en.md` or `docs/report-cn.md`
- Git repository commit history if it reflects your contribution

## Interview Talking Points

- Why standardization is preferable to raw-unit averaging in the index.
- Why `approvals / applications` is only a proxy and not a true approval probability.
- Why quarterly negative-equity observations are forward-filled but still treated as quarterly evidence.
- Why a zero-lag correlation between applications and transactions is more defensible than declaring a one-way lead.
- How the weighting sensitivity supports, but does not prove, robustness.
