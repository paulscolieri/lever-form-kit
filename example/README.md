# Quote form example

A native quote form for a small business website. The customer picks options and sees a live price, then submits. The server re-prices the job, stores it, emails the customer an itemized quote, emails the owner, and optionally pings Slack.

The example business is a landscaping company. Every business-specific piece is in one obvious file so it can be swapped.

## 1. Run locally

Needs Node 22.18 or newer.

1. `cp .env.example .env.local`
2. `npm install`
3. `npm run dev`
4. Open http://localhost:3000

With no env vars set, the form prices jobs and the API answers; email, Slack and storage are skipped with a note in the terminal. Add keys as you go.

## 2. Environment variables

| Variable | Needed for | Notes |
|---|---|---|
| `RESEND_API_KEY` | Emails | From the Resend dashboard |
| `RESEND_FROM` | Emails | Sender on a domain verified in Resend, e.g. `Quotes <quotes@yourdomain.com>` |
| `OWNER_EMAIL` | Owner alert | Where each new submission is sent |
| `SLACK_WEBHOOK_URL` | Slack (optional) | Incoming webhook URL for a channel |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Storage option A | Both required; run `supabase/schema.sql` first |
| `SHEET_WEBHOOK_URL` | Storage option B | Apps Script web app URL; used only if Supabase is not set |

All of them are server-side only. Never add a `NEXT_PUBLIC_` prefix.

## 3. Change the rate card

Everything is in `lib/pricing.ts`, in the `RATE_CARD` object at the top. Prices are in cents.

1. Edit a number or label. The form, the emails and the stored record all read from the same object.
2. Add an option by adding a line to `lotSizes`, `addOns` or `frequencies`. It appears in the form automatically.
3. Change the rules (minimum, rush fee, which lot sizes need a site visit) in the same object.
4. Run `npm test` and update `lib/pricing.test.ts` so the expected totals match your new numbers.

## 4. Swap the business

Edit in this order:

1. `lib/business.ts`: name, tagline, phone, brand color for emails.
2. `lib/pricing.ts`: replace the rate card. If your inputs are not lot size, add-ons and frequency, rename the fields in `JobSpec` and rewrite `compute` to match your rules. Keep it a pure function.
3. `lib/schema.ts`: validate any field you added or renamed in step 2.
4. `components/QuoteForm.tsx`: change the inputs to match. Each input writes one field of the form state.
5. `lib/notify.ts`: adjust `describe` and the email wording.
6. `app/globals.css`: set `--brand`, `--font` and `--radius` to match your site.
7. If you changed fields: update `supabase/schema.sql` and `toRow` in `lib/store.ts`, or `COLUMNS` in `google-sheet/Code.gs`.

## 5. Storage

Supabase:

1. Create a project, open the SQL editor, run `supabase/schema.sql`.
2. Copy the project URL and the service role key (Settings > API) into the env vars.

Google Sheet:

1. Follow the five steps at the top of `google-sheet/Code.gs`.
2. Put the web app URL in `SHEET_WEBHOOK_URL`.

## 6. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel, click New Project, import the repo. If the form lives in a subfolder, set that as the root directory.
3. Add the environment variables from step 2 under Settings > Environment Variables.
4. Deploy. Submit a test quote and check the terminal logs under the deployment if anything is skipped.
5. Verify your sending domain in Resend before going live, or customer emails will not be delivered.

## 7. Scripts

- `npm run dev`: local server with hot reload
- `npm run typecheck`: type-check without building
- `npm test`: unit tests for the pricing rules
- `npm run build`: production build (Vercel runs this)
