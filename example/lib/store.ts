import { createClient } from "@supabase/supabase-js";
import type { Quote } from "./pricing";
import type { Submission } from "./schema";

export type QuoteRecord = Submission & Quote & { createdAt: string };

// Supabase if configured, else the Google Sheet webhook, else nothing
export async function storeSubmission(record: QuoteRecord) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SHEET_WEBHOOK_URL } = process.env;

  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabase.from("quotes").insert(toRow(record));
    if (error) throw new Error(error.message);
    return;
  }

  if (SHEET_WEBHOOK_URL) {
    const res = await fetch(SHEET_WEBHOOK_URL, { method: "POST", body: JSON.stringify(record) });
    if (!res.ok) throw new Error(`Sheet webhook returned ${res.status}`);
    return;
  }

  console.log(`[store] No storage configured, submission from ${record.email} was not saved`);
}

// Column names match supabase/schema.sql:
//   create table quotes (id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
//     name text, email text, phone text, address text, notes text, lot_size text, add_ons text[], frequency text,
//     rush boolean, eligible boolean, reason text, line_items jsonb, total_cents integer)
function toRow(record: QuoteRecord) {
  return {
    created_at: record.createdAt,
    name: record.name,
    email: record.email,
    phone: record.phone,
    address: record.address,
    notes: record.notes,
    lot_size: record.lotSize,
    add_ons: record.addOns,
    frequency: record.frequency,
    rush: record.rush,
    eligible: record.eligible,
    reason: record.reason ?? null,
    line_items: record.lineItems,
    total_cents: record.totalCents,
  };
}
