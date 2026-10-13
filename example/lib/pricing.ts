// Rate card: change prices, labels and rules here. All money is in cents.
export const RATE_CARD = {
  // Base price per visit, chosen by lot size
  lotSizes: {
    small: { label: "Under 1/4 acre", baseCents: 6000 },
    medium: { label: "1/4 to 1/2 acre", baseCents: 9000 },
    large: { label: "1/2 to 1 acre", baseCents: 14000 },
    xl: { label: "1 to 2 acres", baseCents: 22000 },
    estate: { label: "Over 2 acres", baseCents: 0 },
  },
  // Lot sizes we will not price instantly; the customer gets this reason instead
  siteVisitLotSizes: ["estate"],
  siteVisitReason: "Lots over 2 acres are priced after a free site visit. Send your details and we will reach out to schedule one.",
  // Optional services, flat price per visit
  addOns: {
    edging: { label: "Edging and trimming", cents: 2500 },
    hedges: { label: "Hedge trimming", cents: 6000 },
    leaves: { label: "Leaf cleanup", cents: 4500 },
    fertilizer: { label: "Fertilizer treatment", cents: 3500 },
  },
  // Multiplier on the per-visit subtotal: 0.85 is 15% off, 1.3 is 30% more
  frequencies: {
    weekly: { label: "Weekly", multiplier: 0.85 },
    biweekly: { label: "Every two weeks", multiplier: 1 },
    monthly: { label: "Monthly", multiplier: 1.15 },
    once: { label: "One time", multiplier: 1.3 },
  },
  // Flat fee when the customer wants service within 48 hours
  rushFeeCents: 5000,
  // No visit is billed below this amount
  minimumCents: 7500,
};

export type LotSize = keyof typeof RATE_CARD.lotSizes;
export type AddOn = keyof typeof RATE_CARD.addOns;
export type Frequency = keyof typeof RATE_CARD.frequencies;

export type JobSpec = {
  lotSize: LotSize;
  addOns: AddOn[];
  frequency: Frequency;
  rush: boolean;
};

export type LineItem = { label: string; amountCents: number };

export type Quote = {
  eligible: boolean;
  reason?: string;
  lineItems: LineItem[];
  totalCents: number;
};

// Pure function: same inputs always give the same quote, no network, no clock
export function compute(spec: JobSpec): Quote {
  if (RATE_CARD.siteVisitLotSizes.includes(spec.lotSize)) {
    return { eligible: false, reason: RATE_CARD.siteVisitReason, lineItems: [], totalCents: 0 };
  }

  const lot = RATE_CARD.lotSizes[spec.lotSize];
  const lineItems: LineItem[] = [{ label: `Base visit (${lot.label})`, amountCents: lot.baseCents }];

  for (const key of spec.addOns) {
    lineItems.push({ label: RATE_CARD.addOns[key].label, amountCents: RATE_CARD.addOns[key].cents });
  }

  const frequency = RATE_CARD.frequencies[spec.frequency];
  if (frequency.multiplier !== 1) {
    const adjustment = Math.round(sum(lineItems) * (frequency.multiplier - 1));
    lineItems.push({ label: `${frequency.label} rate`, amountCents: adjustment });
  }

  if (spec.rush) {
    lineItems.push({ label: "Rush service (within 48 hours)", amountCents: RATE_CARD.rushFeeCents });
  }

  const shortfall = RATE_CARD.minimumCents - sum(lineItems);
  if (shortfall > 0) {
    lineItems.push({ label: "Minimum visit charge", amountCents: shortfall });
  }

  return { eligible: true, lineItems, totalCents: sum(lineItems) };
}

export function money(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function sum(items: LineItem[]): number {
  return items.reduce((total, item) => total + item.amountCents, 0);
}
