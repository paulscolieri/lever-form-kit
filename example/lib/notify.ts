import { Resend } from "resend";
import { BUSINESS } from "./business";
import { money, RATE_CARD, type Quote } from "./pricing";
import type { Submission } from "./schema";

export async function sendCustomerQuote(spec: Submission, quote: Quote) {
  const intro = quote.eligible
    ? `Hi ${esc(spec.name)}, here is your estimate for ${describe(spec)}. Reply to this email to book.`
    : `Hi ${esc(spec.name)}, thanks for reaching out about ${describe(spec)}.`;
  await sendEmail({
    to: spec.email,
    subject: quote.eligible ? `Your quote from ${BUSINESS.name}` : `Next step: a site visit from ${BUSINESS.name}`,
    html: quoteHtml(intro, quote),
  });
}

export async function sendOwnerAlert(spec: Submission, quote: Quote) {
  const contact = [spec.email, spec.phone, spec.address].filter(Boolean).map(esc).join(" | ");
  const intro = `New quote request from <strong>${esc(spec.name)}</strong><br>${contact}<br>${describe(spec)}` +
    (spec.notes ? `<br>Notes: ${esc(spec.notes)}` : "");
  await sendEmail({
    to: process.env.OWNER_EMAIL ?? "",
    replyTo: spec.email,
    subject: `Quote request: ${spec.name}, ${quote.eligible ? money(quote.totalCents) : "site visit"}`,
    html: quoteHtml(intro, quote),
  });
}

export async function pingSlack(spec: Submission, quote: Quote) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  const price = quote.eligible ? money(quote.totalCents) : "needs site visit";
  const text = `New quote: ${spec.name} <${spec.email}> | ${describe(spec)} | ${price}`;
  const res = await fetch(url, { method: "POST", body: JSON.stringify({ text }) });
  if (!res.ok) throw new Error(`Slack webhook returned ${res.status}`);
}

async function sendEmail(msg: { to: string; subject: string; html: string; replyTo?: string }) {
  const { RESEND_API_KEY, RESEND_FROM } = process.env;
  if (!RESEND_API_KEY || !RESEND_FROM || !msg.to) {
    console.log(`[notify] Email not configured, skipped "${msg.subject}"`);
    return;
  }
  const { error } = await new Resend(RESEND_API_KEY).emails.send({ from: RESEND_FROM, ...msg });
  if (error) throw new Error(error.message);
}

// One small template shared by both emails: a branded header and the line items
function quoteHtml(intro: string, quote: Quote): string {
  const cell = "padding:8px 0;border-bottom:1px solid #e5e5e5";
  const rows = quote.lineItems
    .map((item) => `<tr><td style="${cell}">${esc(item.label)}</td><td style="${cell};text-align:right">${money(item.amountCents)}</td></tr>`)
    .join("");
  const body = quote.eligible
    ? `<table style="width:100%;border-collapse:collapse">${rows}<tr><td style="padding:12px 0;font-weight:bold">Total per visit</td><td style="padding:12px 0;font-weight:bold;text-align:right">${money(quote.totalCents)}</td></tr></table>`
    : `<p>${esc(quote.reason ?? "")}</p>`;
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#222">
  <div style="background:${BUSINESS.brandColor};color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;font-size:18px"><strong>${esc(BUSINESS.name)}</strong></div>
  <div style="padding:20px;border:1px solid #e5e5e5;border-top:0;border-radius:0 0 8px 8px">
    <p>${intro}</p>
    ${body}
    <p style="color:#666;font-size:13px;margin-top:24px">${esc(BUSINESS.name)} | ${esc(BUSINESS.phone)}</p>
  </div>
</div>`;
}

function describe(spec: Submission): string {
  const parts = [RATE_CARD.lotSizes[spec.lotSize].label, RATE_CARD.frequencies[spec.frequency].label.toLowerCase()];
  for (const key of spec.addOns) parts.push(RATE_CARD.addOns[key].label.toLowerCase());
  if (spec.rush) parts.push("rush");
  return parts.join(", ");
}

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
