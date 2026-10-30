# Methodology

## Research Questions

1. How do mortgage applications and approval activity change during a rising-rate cycle?
2. Do residential transactions lead or lag mortgage activity?
3. How are negative-equity cases related to rates, unemployment and transaction volumes?
4. Can a transparent monthly Housing Mortgage Stress Index summarize these risks?

## Sample

- Frequency: monthly
- Period: 2018-01 to 2025-12
- Observations: 96 monthly rows
- Regimes:
  - Pre-hiking: 2018-01 to 2022-02
  - Hiking cycle: 2022-03 to 2023-08
  - Post-hiking: 2023-09 to 2025-12

The regime boundaries are analyst-defined from the sustained rise and subsequent high plateau in the 3-month HIBOR cycle. They are comparison windows, not estimated structural breaks.

## Derived Variables

- `approval_to_application_ratio_pct = 100 × approvals / applications`
  - This is not a cohort approval rate because applications and approvals in the same month need not belong to the same cases.
- `residential_transactions_3m_pct`: three-month percentage change in residential sale-and-purchase agreements.
- `residential_transactions_yoy_pct`: year-on-year percentage change, used for period context.
- `hibor_3m_change_pp`: monthly change in the monthly average 3-month HIBOR, in percentage points.

## Stress Index

Four components are standardized over the sample:

1. Interest-rate stress: `z(3M HIBOR)`
2. Negative-equity stress: `z(negative-equity cases)`
3. Market-contraction stress: `z(-3-month transaction change)`
4. Labour-market stress: `z(unemployment rate)`

The raw composite is:

```text
stress_z = Σ weight_i × z_i
stress_index = clip(50 + 10 × stress_z, 0, 100)
```

### Weight Sensitivity

| Scheme | Rate | Negative equity | Transaction drop | Unemployment |
| --- | ---: | ---: | ---: | ---: |
| Equal | 25% | 25% | 25% | 25% |
| Rate-dominant | 35% | 30% | 20% | 15% |
| Borrower-dominant | 25% | 35% | 20% | 20% |

The three variants peak within 58.7 to 60.7 and in the same broad high-stress window. This supports timing robustness but does not validate the index as a probability model.

## Lead-Lag Analysis

For each variable pair, Pearson correlations are calculated from -12 to +12 months:

```text
corr(driver.shift(lag), outcome)
```

A positive lag means the driver occurs earlier than the outcome. The reported "best lag" maximizes the absolute correlation and is exploratory. It is not a Granger-causality test or a structural model.

## Data Quality

- Negative-equity data are published quarterly. Quarter-end values are carried forward to the following months for visualization and index continuity.
- The first two months of 2018 have no earlier negative-equity observation.
- The three-month transaction change requires three observations, so the stress index begins in 2018-04.
- Values marked `*`, `N.A.` or `-` in official tables are converted to missing rather than silently treated as zero.
- CPI is a contextual variable. GDP is not included because it is quarterly and is not one of the proposed index components.

## Interpretation Limits

- Correlation can reflect shared trends, policy changes or omitted variables.
- The sample includes COVID-19 disruptions and property-policy changes.
- Monthly aggregate data cannot identify borrower-level default or refinancing risk.
- Negative-equity figures are extrapolated survey results and are less frequent than other variables.
- The index is designed for transparent comparison and communication, not underwriting, trading or forecasting.
