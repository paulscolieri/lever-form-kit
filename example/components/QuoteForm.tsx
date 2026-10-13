"use client";

import { useState } from "react";
import { compute, money, RATE_CARD, type AddOn, type Frequency, type LotSize } from "@/lib/pricing";
import type { Submission } from "@/lib/schema";

type FormState = Submission & { website: string };

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
  lotSize: "medium",
  addOns: [],
  frequency: "biweekly",
  rush: false,
  website: "",
};

const lotSizes = Object.keys(RATE_CARD.lotSizes) as LotSize[];
const addOns = Object.keys(RATE_CARD.addOns) as AddOn[];
const frequencies = Object.keys(RATE_CARD.frequencies) as Frequency[];

export default function QuoteForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [step, setStep] = useState<"details" | "review" | "sent">("details");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Live estimate: same pure function the server runs, no request needed
  const quote = compute(form);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleAddOn(key: AddOn, on: boolean) {
    set("addOns", on ? [...form.addOns, key] : form.addOns.filter((k) => k !== key));
  }

  async function submit() {
    setSending(true);
    setError("");
    const res = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);
    setSending(false);
    if (!res?.ok) {
      setError("Something went wrong sending your quote. Please try again or give us a call.");
      return;
    }
    setStep("sent");
  }

  if (step === "sent") {
    return (
      <section className="card" aria-live="polite">
        <h2>Sent</h2>
        <p>
          {quote.eligible
            ? `Your itemized quote is on its way to ${form.email}. Reply to that email to book.`
            : `Thanks ${form.name}. We have your details and will reach out to schedule a site visit.`}
        </p>
      </section>
    );
  }

  if (step === "review") {
    return (
      <section className="card">
        <h2>{quote.eligible ? "Your estimate" : "Next step: site visit"}</h2>
        {quote.eligible ? (
          <table className="lines">
            <tbody>
              {quote.lineItems.map((item) => (
                <tr key={item.label}>
                  <td>{item.label}</td>
                  <td>{money(item.amountCents)}</td>
                </tr>
              ))}
              <tr className="total">
                <td>Total per visit</td>
                <td>{money(quote.totalCents)}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>{quote.reason}</p>
        )}
        <p className="muted">We will send this to {form.email}.</p>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button type="button" onClick={submit} disabled={sending}>
            {sending ? "Sending..." : quote.eligible ? "Email me this quote" : "Request a site visit"}
          </button>
          <button type="button" className="secondary" onClick={() => setStep("details")} disabled={sending}>
            Edit details
          </button>
        </div>
      </section>
    );
  }

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        setStep("review");
      }}
    >
      <fieldset>
        <legend>Your property</legend>

        <label>
          <span>Lot size</span>
          <select value={form.lotSize} onChange={(e) => set("lotSize", e.target.value as LotSize)}>
            {lotSizes.map((key) => (
              <option key={key} value={key}>
                {RATE_CARD.lotSizes[key].label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>How often</span>
          <select value={form.frequency} onChange={(e) => set("frequency", e.target.value as Frequency)}>
            {frequencies.map((key) => (
              <option key={key} value={key}>
                {RATE_CARD.frequencies[key].label}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend>Add-ons</legend>
          {addOns.map((key) => (
            <label key={key} className="check">
              <input
                type="checkbox"
                checked={form.addOns.includes(key)}
                onChange={(e) => toggleAddOn(key, e.target.checked)}
              />
              {RATE_CARD.addOns[key].label} ({money(RATE_CARD.addOns[key].cents)})
            </label>
          ))}
        </fieldset>

        <label className="check">
          <input type="checkbox" checked={form.rush} onChange={(e) => set("rush", e.target.checked)} />
          I need service within 48 hours (+{money(RATE_CARD.rushFeeCents)})
        </label>
      </fieldset>

      <fieldset>
        <legend>Your details</legend>

        <label>
          <span>Name</span>
          <input type="text" required autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </label>

        <label>
          <span>Email</span>
          <input type="email" required autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </label>

        <label>
          <span>Phone (optional)</span>
          <input type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </label>

        <label>
          <span>Property address (optional)</span>
          <input type="text" autoComplete="street-address" value={form.address} onChange={(e) => set("address", e.target.value)} />
        </label>

        <label>
          <span>Anything we should know? (optional)</span>
          <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </label>

        <div className="honeypot" aria-hidden="true">
          <label>
            <span>Website</span>
            <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
          </label>
        </div>
      </fieldset>

      <div className="estimate" aria-live="polite">
        {quote.eligible ? (
          <>
            <span>Estimated per visit</span>
            <strong>{money(quote.totalCents)}</strong>
          </>
        ) : (
          <span>{quote.reason}</span>
        )}
      </div>

      <button type="submit">{quote.eligible ? "Review my quote" : "Continue"}</button>
    </form>
  );
}
