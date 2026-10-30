# The Impact of the Interest-Rate Hiking Cycle on Hong Kong Residential Mortgage Risks

**DSC5002 · Group 31 · Monthly exploratory analysis, 2018–2025**

## 1. Executive Summary

This project integrates HKMA mortgage and negative-equity surveys, HIBOR, Land Registry residential transactions, and Census & Statistics Department macro indicators into a 96-month analytical dataset.

During the hiking window, average monthly mortgage applications were 25.3% lower than before the cycle. Approvals fell 17.8% and residential transactions fell 24.3%. Three-month HIBOR has correlations of -0.70 with applications, -0.67 with approvals and -0.46 with transactions.

Applications and transactions peak at zero lag (r=0.67). The reverse test gives the same peak, which supports a synchronous market cycle rather than a stable one-way transmission. Negative equity behaves as a lagged risk: the strongest HIBOR relationship appears at a 12-month lead (r=0.85), although quarterly publication and common trends limit interpretation.

The equal-weight Housing Mortgage Stress Index peaks at 58.7/100 in July 2024. Alternative weighting schemes peak between 58.7 and 60.7, showing similar timing across reasonable specifications.

## 2. Research Questions

1. How do mortgage applications and approvals change during a rising-rate cycle?
2. Do residential transactions lead or lag mortgage activity?
3. How is negative equity related to rates, unemployment and transaction activity?
4. Can a transparent composite index summarize monthly housing mortgage stress?

## 3. Data

The sample covers January 2018 through December 2025.

| Domain | Source | Variables | Frequency |
| --- | --- | --- | --- |
| Mortgage activity | HKMA T0307 | Applications, approvals, LTV, approved value | Monthly |
| Negative equity | HKMA T0316 | Cases, borrower share, value, unsecured portion | Quarterly |
| Rates | HKMA T060302 | 3-month HIBOR | Monthly average |
| Property market | Land Registry | Residential ASP cases and value | Monthly |
| Labour market | Census & Statistics Department | Unemployment rate | Rolling three-month |
| Inflation | Census & Statistics Department | Composite CPI YoY | Monthly |

GDP is not used in the monthly index because it is quarterly and is not one of the four proposed index components. CPI is retained as contextual evidence.

## 4. Method

### Comparison Windows

- Pre-hiking: January 2018 to February 2022
- Hiking cycle: March 2022 to August 2023
- Post-hiking: September 2023 to December 2025

The dates are analyst-defined from the sustained 3-month HIBOR rise and subsequent plateau. They are comparison windows rather than estimated structural breaks.

### Stress Index

Four sample-standardized components are combined:

1. 3-month HIBOR
2. Negative-equity cases
3. Negative three-month transaction change
4. Unemployment rate

```text
stress_index = clip(50 + 10 × Σ weight_i × z_i, 0, 100)
```

Three weighting schemes are tested: equal, rate-dominant and borrower-dominant. The output is a relative-risk gauge, not a default probability.

### Lead-Lag Diagnostics

Pearson correlations are calculated from -12 to +12 months using `corr(driver.shift(lag), outcome)`. Positive lag means the first variable leads. The maximum absolute correlation is exploratory and is not a causal or Granger test.

## 5. Results

| Metric | Pre-hiking | Hiking | Post-hiking |
| --- | ---: | ---: | ---: |
| Average 3M HIBOR | 1.25% | 3.28% | 4.01% |
| Monthly applications | 12,544 | 9,370 | 7,301 |
| Monthly approvals | 8,957 | 7,365 | 5,395 |
| Residential transactions | 5,168 | 3,911 | 4,514 |
| Approval/application ratio | 72.3% | 78.6% | 74.8% |
| Unemployment rate | 4.15% | 3.80% | 3.23% |
| Stress index | 47.6 | 50.2 | 54.5 |

### Mortgage Activity

Rates and mortgage activity move in opposite directions. The strongest contemporaneous relationships are with applications and approvals. HIBOR changes lead transaction declines by three months at the best tested lag, but the correlation is modest at -0.29.

### Transactions and Mortgage Activity

Applications and transactions peak at zero lag (r=0.67). Reversing the pair produces the same zero-lag result. Approvals and transactions are most correlated at a one-month approval lead (r=0.61), but the reverse construction produces the same coefficient. The data support synchronicity, not a stable directional lead.

### Negative Equity

Negative-equity cases increase from 533 in 2022 Q3 to 12,164 in 2022 Q4, 32,073 in 2024 Q1 and 40,741 in 2025 Q1, before falling to 21,304 in 2025 Q4. HIBOR and negative equity are most correlated when rates lead by 12 months. This is consistent with delayed collateral stress but is not causal evidence.

### Stress Index

The equal-weight index peaks at 58.7 in July 2024. Rate-dominant and borrower-dominant variants peak at 60.7 and 59.7. All three place the highest stress in the late-2023 to mid-2024 window. The index eases in 2025 as rates fall and transactions recover, but risk remains above some early low-stress periods.

## 6. Conclusions

1. The hiking cycle coincides with weaker mortgage applications, approvals and transactions.
2. Transactions and mortgage activity are primarily synchronous.
3. Negative equity accumulates with a delay after rate and valuation shocks.
4. The composite index provides an interpretable common scale and is moderately robust to weighting choices.
5. Recovery in transaction volume does not imply immediate recovery in household leverage risk.

## 7. Limitations

- The sample includes COVID-19 and major policy changes.
- Negative equity is quarterly and forward-filled only for continuity.
- Approvals/applications is a ratio of separate flows, not a cohort approval rate.
- Correlation and lag selection can be affected by common trends and omitted variables.
- Aggregate monthly data cannot measure borrower-level default risk.
- The analysis is educational and is not an investment, underwriting or regulatory model.

## 8. References

- Hong Kong Monetary Authority, Monthly Statistical Bulletin, Tables 3.7, 3.16 and 6.3.2.
- Hong Kong Land Registry, Monthly Statistical Data.
- Census and Statistics Department, Hong Kong, Table 210-06103 and Table 510-60001A.
- Project Proposal for DSC5002, Group 31.
