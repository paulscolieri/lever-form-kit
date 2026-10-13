import { RATE_CARD, type AddOn, type Frequency, type JobSpec, type LotSize } from "./pricing";

export type Submission = JobSpec & {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

export type ParseResult =
  | { ok: true; spec: Submission }
  | { ok: false; errors: Record<string, string> };

// Hand-written validation for the one request body this app accepts
export function parseSubmission(body: unknown): ParseResult {
  const raw = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const text = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string).trim() : "");
  const errors: Record<string, string> = {};

  const name = text("name");
  const email = text("email");
  const phone = text("phone");
  const address = text("address");
  const notes = text("notes");
  const addOns = Array.isArray(raw.addOns) ? raw.addOns : [];

  if (!name || name.length > 100) errors.name = "Enter your name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
  if (phone.length > 40) errors.phone = "Phone number is too long";
  if (address.length > 200) errors.address = "Address is too long";
  if (notes.length > 1000) errors.notes = "Keep notes under 1000 characters";
  if (!(typeof raw.lotSize === "string" && raw.lotSize in RATE_CARD.lotSizes)) errors.lotSize = "Choose a lot size";
  if (!(typeof raw.frequency === "string" && raw.frequency in RATE_CARD.frequencies)) errors.frequency = "Choose a frequency";
  if (!addOns.every((key) => typeof key === "string" && key in RATE_CARD.addOns)) errors.addOns = "Unknown add-on";
  // Honeypot: real people never see this field, so anything in it means a bot
  if (text("website")) errors.website = "Must be empty";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    spec: {
      name,
      email,
      phone,
      address,
      notes,
      lotSize: raw.lotSize as LotSize,
      frequency: raw.frequency as Frequency,
      addOns: addOns as AddOn[],
      rush: raw.rush === true,
    },
  };
}
