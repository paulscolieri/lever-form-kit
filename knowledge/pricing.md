---
updated: YYYY-MM-DD
source: owner interview, question 1; price list dated YYYY-MM-DD
---

# Pricing rules

Rules, not prose. Every line here becomes a line in `lib/pricing.ts`. The example rate
card for a landscaping company is below; replace it with yours.

## Unit

Price per: visit (change to per hour, per square foot, per minute, per item)

## Base price by size tier

| Tier | Range | Base per visit |
|---|---|---|
| Small | under 1/4 acre | $60 |
| Medium | 1/4 to 1/2 acre | $90 |
| Large | 1/2 to 1 acre | $140 |
| XL | 1 to 2 acres | $220 |
| Estate | over 2 acres | site visit, no instant price |

## Add-ons (flat, per visit)

| Add-on | Price |
|---|---|
| Edging and trimming | +$25 |
| Hedge trimming | +$60 |
| Leaf cleanup | +$45 |
| Fertilizer treatment | +$35 |

## Frequency (multiplier on the per-visit subtotal)

| Frequency | Multiplier |
|---|---|
| Weekly | 0.85 |
| Every two weeks | 1.0 |
| Monthly | 1.15 |
| One time | 1.3 |

## Minimum, rush, exceptions

- Minimum per visit: $75
- Rush (within 48 hours): +$50 flat
- Instant pricing does not apply when the lot is over 2 acres. Those get: "priced after a
  free site visit, send your details and we'll reach out to schedule one."

These are the exact values in `example/lib/pricing.ts`. Change them here first, then there.

## Real quotes to test against

Three jobs you quoted recently, with the answer, so the pricing function can be checked:

1. ... → $
2. ... → $
3. ... → $
