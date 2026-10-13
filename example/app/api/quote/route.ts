import { parseSubmission } from "@/lib/schema";
import { compute } from "@/lib/pricing";
import { storeSubmission } from "@/lib/store";
import { pingSlack, sendCustomerQuote, sendOwnerAlert } from "@/lib/notify";

export async function POST(req: Request) {
  // 1. Validate: reject anything that is not a well-formed submission
  const parsed = parseSubmission(await req.json().catch(() => null));
  if (!parsed.ok) {
    // A filled honeypot means a bot: pretend it worked and drop it
    if (parsed.errors.website) return Response.json({ ok: true });
    return Response.json({ ok: false, errors: parsed.errors }, { status: 400 });
  }
  const spec = parsed.spec;

  // 2. Compute: the same pure function the browser used for the live estimate
  const quote = compute(spec);
  const record = { ...spec, ...quote, createdAt: new Date().toISOString() };

  // 3. Store: best effort, a failure is logged and never shown to the customer
  await storeSubmission(record).catch((err) => console.error("[store]", err));

  // 4. Notify: each channel is independent, one failing does not stop the others
  const sent = await Promise.allSettled([sendCustomerQuote(spec, quote), sendOwnerAlert(spec, quote), pingSlack(spec, quote)]);
  for (const result of sent) {
    if (result.status === "rejected") console.error("[notify]", result.reason);
  }

  return Response.json({ ok: true, quote });
}
