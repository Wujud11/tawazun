# Enterprise Demo Validation Report

**Status:** PASSED

All presentation KPIs are produced by running the generated dataset through the existing `computeNetting()` algorithm. No metrics are hand-authored.

## Provenance

| Field | Value |
| --- | --- |
| Algorithm | `computeNetting() → computeNetTransfers() (netting-core)` |
| Companies | 420 |
| Relationships (all) | 4234 |
| Active relationships (transfers before) | 3906 |
| Net transfers (transfers after) | 419 |

Source files:

- `server/lib/derive.ts`
- `src/lib/netting-core.ts`
- `scripts/generate-enterprise-demo.ts`

## KPIs (algorithm output)

| KPI | Value |
| --- | --- |
| Companies count | 420 |
| Relationships count | 4234 |
| Gross debt (SAR) | 1,329,989,427 |
| Net obligation (SAR) | 229,057,683 |
| Transfers before | 3906 |
| Transfers after | 419 |
| Savings (SAR) | 1,100,931,744 |
| Improvement % (volume) | 83% |
| Transfer-count reduction % | 89% |

## Mathematical conservation checks

| Check | Result | Detail |
| --- | --- | --- |
| `money_conserved_sum_balances_zero` | PASS | Σ net balances = 0 (must be 0) |
| `gross_equals_sum_active_amounts` | PASS | grossVolume=1329989427 |
| `net_volume_equals_sum_net_transfers` | PASS | netVolume=229057683, Σ transfers=229057683 |
| `positive_balances_equal_negative_abs` | PASS | Σ+ = 229057683, Σ|−| = 229057683 |
| `net_volume_equals_positive_balance_total` | PASS | netVolume=229057683, Σ+ = 229057683 |
| `savings_identity` | PASS | savings=1100931744 = 1329989427 − 229057683 |
| `no_value_created` | PASS | net ≤ gross and savings ≥ 0 |
| `portfolio_mirrors_algorithm` | PASS | demoPortfolio fields equal computeNetting() metrics |
| `company_balance_count_matches` | PASS | 420 company balances |
| `scale_companies` | PASS | 420 companies |
| `scale_relationships` | PASS | 4234 relationships |

### Identities verified

1. **Total money preserved:** Σ company net balances = 0.
2. **Net balances preserved:** Σ positive balances = Σ |negative balances| = net settlement volume.
3. **No value created or lost:** savings = gross − net ≥ 0 and net ≤ gross.
4. **UI KPIs = algorithm:** `demoPortfolio` fields are copied from `computeNetting()` output at generation time.

## How to regenerate

```bash
npm run demo:generate
```

