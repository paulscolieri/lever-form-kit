// Run with: npm test (Node 22.18 or newer runs TypeScript directly)
import { test } from "node:test";
import assert from "node:assert/strict";
import { compute } from "./pricing.ts";

test("base price only", () => {
  const quote = compute({ lotSize: "medium", addOns: [], frequency: "biweekly", rush: false });
  assert.equal(quote.eligible, true);
  assert.equal(quote.totalCents, 9000);
  assert.equal(quote.lineItems.length, 1);
});

test("weekly discount then topped up to the minimum", () => {
  const quote = compute({ lotSize: "small", addOns: [], frequency: "weekly", rush: false });
  assert.deepEqual(
    quote.lineItems.map((item) => item.amountCents),
    [6000, -900, 2400],
  );
  assert.equal(quote.totalCents, 7500);
});

test("add-ons, one-time rate and rush fee", () => {
  const quote = compute({ lotSize: "large", addOns: ["edging", "hedges"], frequency: "once", rush: true });
  assert.equal(quote.totalCents, 14000 + 2500 + 6000 + 6750 + 5000);
});

test("total always equals the sum of line items", () => {
  const quote = compute({ lotSize: "xl", addOns: ["leaves"], frequency: "monthly", rush: false });
  const sum = quote.lineItems.reduce((total, item) => total + item.amountCents, 0);
  assert.equal(quote.totalCents, sum);
});

test("large lots need a site visit", () => {
  const quote = compute({ lotSize: "estate", addOns: ["edging"], frequency: "weekly", rush: true });
  assert.equal(quote.eligible, false);
  assert.match(quote.reason ?? "", /site visit/);
  assert.deepEqual(quote.lineItems, []);
  assert.equal(quote.totalCents, 0);
});
