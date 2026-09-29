# PocketMint — Market Analysis

> **Evidence base.** This document was researched on 2026-09-29 from vendor pricing pages,
> published analyst figures and the owner's market-review work (2026-09-26). No number
> here is invented. Where a figure could not be independently verified it is marked
> **[TO BE VALIDATED]**; verify it before the document is used in an investor or
> grant setting. Sources are listed in §8.

## 1. Product in one sentence

> PocketMint — an offline-capable, multi-currency expense-tracker PWA.

## 2. Problem statement

- **Who feels the problem:** Budget-conscious individuals tracking expenses, incl. multi-currency.
- **What they do today instead:** manual processes, spreadsheets, rented SaaS — see §4.
- **Cost of the status quo:** measurable in lost revenue / manual labor overhead
  **[TO BE VALIDATED for this specific segment]**.

## 3. Market definition

| Field | Value |
| --- | --- |
| Category | Personal finance / expense tracking |
| Geographic scope | Global |
| Target segment / persona | Budget-conscious individuals tracking expenses, incl. multi-currency |
| Estimated total addressable market | Mature, heavily populated personal-finance category **[TO BE VALIDATED — cite a specific figure]** |
| Serviceable addressable market | Depends on distribution reach; **[TO BE VALIDATED]** |
| Beachhead segment | Budget-conscious individuals tracking expenses, incl. multi-currency |

## 4. Demand signals

> Steady SMB/consumer demand; strong incumbents

| Signal | Evidence | Status |
| --- | --- | --- |
| Category demand | Mature/validated category with well-funded entrants | Confirmed |
| Competitive floor | Incumbent pricing and free tiers are public and low | Confirmed (see §5) |
| Own sales/usage data | Not instrumented in this repo | **[TO BE MEASURED]** |

## 5. Competitive landscape

| Competitor | Entry price (2026) | Positioning | Weakness we can exploit |
| --- | --- | --- | --- |
| **Wallet (BudgetBakers)** | Free / paid upgrades | Multi-account budgeting | Freemium upsells |
| **Money Manager (Realbyte)** | Free / ~$5 | Simple expense tracking | Ads in free tier |
| **YNAB** | ~$14.99/mo | Zero-based budgeting | Pricey for casual |
| **Firefly III** | Self-hosted OSS | Personal finance ledger | Setup burden |

## 6. Differentiation

Grounded in what this build actually does (see `06-architecture.md`):

- **Distinctive capability in code:** Offline-first, multi-currency PWA with no server dependency; a solid portfolio piece in a mature market rather than a market-defining product.
- **Capability a competitor would need to replicate:** proxy of the build's core path.
- **Why defensible:** depth of vertical fit and delivery ownership, not a generic dashboard.

## 7. Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Category commoditized / incumbent floor falling | Medium–High | Medium | Position on differentiation above, not price |
| Unverified market figures | High | High | Keep `[TO BE VALIDATED]` markers until sourced |
| Claims ahead of code (demo vs. shipped) | Medium | High | Keep README/copy aligned with the source tree |

## 8. Sources

Accessed 2026-09-29; vendor pricing changes — re-verify before any pricing decision.

- https://budgetbakers.com
- https://realbyteapps.app/
- https://www.ynab.com/pricing
