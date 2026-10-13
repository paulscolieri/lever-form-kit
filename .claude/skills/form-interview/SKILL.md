---
name: form-interview
description: Interview a business owner, one question at a time, to build a native website quote form with live pricing, notifications and storage. Use when someone wants a quote form, lead intake form, pricing calculator or "instant estimate" on their site, or wants to replace an embedded form builder (Jotform, Typeform, Cognito, Google Forms).
---

# Form interview

You are building a form that does the job of the owner's first sales reply: it prices
the work, tells the right people, and looks like their business. You do that by
interviewing the owner first and building second. Never build from a blank prompt.

## Rules

1. **Read before you ask.** Look at whatever exists: the live website, a price list or
   quote spreadsheet, past quote emails, the Google Business Profile, the files in
   `knowledge/`. Draft answers from that evidence.
2. **One question at a time.** Ask it, show your draft answer underneath, wait. The owner
   corrects a draft faster than they explain from scratch. Keep each question short
   enough to answer out loud.
3. **Write every answer down** in `knowledge/` as you go (see "The knowledge base").
   The form is the first thing built from those files. The site, the follow-up emails
   and the dashboards read the same files later.
4. **Plain language in, plain language out.** The owner never needs to read code. When
   you explain a decision, explain it as a business decision.
5. **Skip a question** when an earlier answer already covered it.

## The six questions, in order

**1. What decides the price?**
Prefill from the price list. You are looking for: the unit (per hour, per square foot,
per visit, per minute), tiers, a minimum, add-ons, a rush or priority fee, and the rule
that disqualifies a job from instant pricing (needs a site visit, over a size limit,
outside the service area). Write the result to `knowledge/pricing.md` as rules, not
prose. This becomes `lib/pricing.ts`.

**2. What do you need to know before you can quote?**
The fields. Mark each one: changes the price / just gets stored / optional. Push back
on long forms: the fewer fields before the first price, the fewer people leave. Propose
a two-step form: step 1 is only what the price needs plus name and email, step 2 is
everything else. Capture the lead at step 1 so an abandoned step 2 can still be
followed up.

**3. Who should hear about a submission, and where?**
Default: the customer gets the itemized quote by email; the owner gets an email; the
team gets a Slack (or Teams) message if they live there. Ask what the customer email
should say and in what tone. Write tone notes to `knowledge/voice.md`.

**4. Where should submissions live?**
Default to a Google Sheet. Move to a database (Supabase) when they want to count,
follow up automatically, or build on it later (customer portal, dashboards). Say the
trade-off in one sentence and let them choose.

**5. What should it look like?**
Pull fonts, colors and spacing from the live site so the form is the page, not a box
on the page. If there is a brand guide, use it. If there is no site worth matching,
ask for two sites they like and borrow from those.

**6. What happens after?**
Who follows up, how fast, by what channel. Whether a quote becomes a checkout link or
an invoice. Whether an unconverted quote gets a reminder and when. This decides
whether storage is optional or required.

## The knowledge base

Four files, markdown, written for the owner to read and correct:

| File | Holds |
|---|---|
| `knowledge/business.md` | What they sell, to whom, service area, hours, what makes them different |
| `knowledge/pricing.md` | The rules from question 1, as a table or list, with units and exceptions |
| `knowledge/voice.md` | How they talk to customers: greetings, sign-off, words they never use |
| `knowledge/customers.md` | Who matters: segments, repeat customers, where they come from |

Each file starts with front matter: `updated: YYYY-MM-DD` and `source:` (who said it,
when). When the owner corrects something, change the file, not just the code.

## Build order, after the interview

1. `lib/pricing.ts` from `knowledge/pricing.md`. Pure function. Write three test cases
   from real quotes the owner remembers and make them pass.
2. The form component: step 1 fields, live estimate, step 2 details, one submit.
3. The route handler in four parts, in this order: validate, compute, store, notify.
   Store and notify are independent; one failing never blocks the other.
4. Styling from the live site's variables.
5. A dry run with the owner's own email as the customer. Show them the email, the
   Slack line and the stored row before anything goes live.

Start from `example/` in this repo. Change the rate card and the fields first; the
handler, notifications and storage rarely need to change.

## What not to do

- Do not add a captcha. Use the honeypot field in the example.
- Do not collect anything the owner cannot name a use for.
- Do not promise marketing email. This form sends transactional email (quotes,
  confirmations, alerts). Newsletters are a different tool and a different decision.
- Do not build a database because it is possible. Build it because question 6 needs it.
