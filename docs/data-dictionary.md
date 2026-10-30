# Data Dictionary

## Primary Monthly Fields

| Field | Unit | Source | Frequency |
| --- | --- | --- | --- |
| `hibor_3m_pct` | % p.a. | HKMA T060302 | Monthly average |
| `new_applications_received` | cases | HKMA T0307 | Monthly |
| `new_loans_approved_count` | cases | HKMA T0307 | Monthly |
| `new_loans_approved_hkd_mn` | HK$ million | HKMA T0307 | Monthly |
| `loan_to_value_ratio_pct` | % | HKMA T0307 | Monthly |
| `residential_transactions` | cases | Land Registry | Monthly |
| `residential_transaction_value_hkd_mn` | HK$ million | Land Registry | Monthly |
| `negative_equity_count` | cases | HKMA T0316 | Quarterly, forward-filled |
| `negative_equity_pct_of_borrowers` | % | HKMA T0316 | Quarterly, forward-filled |
| `negative_equity_outstanding_hkd_mn` | HK$ million | HKMA T0316 | Quarterly, forward-filled |
| `unemployment_rate_pct` | % | Census & Statistics Department | Rolling three-month |
| `cpi_yoy_pct` | % | Census & Statistics Department | Monthly |

## Derived Fields

| Field | Definition |
| --- | --- |
| `approval_to_application_ratio_pct` | Same-month approvals divided by applications, expressed as percent |
| `residential_transactions_3m_pct` | Three-month percentage change in residential transactions |
| `residential_transactions_yoy_pct` | Year-on-year percentage change in residential transactions |
| `hibor_3m_change_pp` | Month-to-month change in 3-month HIBOR |
| `z_interest_rate` | Standardized 3-month HIBOR |
| `z_negative_equity` | Standardized negative-equity cases |
| `z_transaction_drop` | Standardized negative of three-month transaction change |
| `z_unemployment` | Standardized unemployment rate |
| `stress_index_*` | Weighted composite transformed to a bounded 0-100 scale |
| `cycle_period` | Pre-hiking, hiking or post-hiking comparison window |

## Output Files

- `monthly_data.csv`: complete merged analysis table
- `quarterly_negative_equity.csv`: original quarterly negative-equity observations
- `period_summary.csv`: average metrics for each cycle window
- `correlation_lags.csv`: full lag-correlation profiles
- `best_lags.csv`: highest absolute correlation for each tested pair
- `analysis_summary.json`: machine-readable headline results and quality notes
- `dashboard/data.js`: browser-safe dashboard payload
