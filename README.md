# lever-form-kit

Your website's form should do the job of your first sales reply: price the work, tell
the right people, and look like your business. Embedded form builders do none of that.
This repo is the Claude skill that interviews you and builds one that does, plus a
working example to start from.

From the video: Jotform vs Typeform vs Your Own Form (link added when it's live)

## What's here

| Path | What it is |
|---|---|
| `.claude/skills/form-interview/SKILL.md` | The Claude Code skill. Six questions, asked one at a time, answers saved to `knowledge/`, then the build order. |
| `knowledge/` | Four template files the interview fills in: business, pricing, voice, customers. Your form is built from these, and so is everything after it. |
| `example/` | A working Next.js quote form: live pricing from a rate card, two-step form, email to the customer and owner (Resend), optional Slack ping, storage in a Google Sheet or Supabase. |

## Use it

1. Install [Claude Code](https://claude.com/claude-code) and clone this repo (or copy
   `.claude/skills/form-interview` and `knowledge/` into your own site's repo).
2. Open Claude Code in the folder and type:

   ```
   /form-interview
   ```

3. Answer the six questions. Claude drafts each answer from your site and price list
   first; you correct it. Everything you say lands in `knowledge/`.
4. Claude builds the form from `example/`, changing the rate card and fields first.
5. Dry-run it with your own email as the customer before it goes live.

Running the example on its own: see [`example/README.md`](example/README.md).

## The six questions

1. What decides the price?
2. What do you need to know before you can quote?
3. Who should hear about a submission, and where?
4. Where should submissions live?
5. What should it look like?
6. What happens after?

Answer those on one page and you have the brief, whether you hand it to Claude or to
whoever builds your site.

## The team the example runs on

| Role | Tool | Cost at local-business scale |
|---|---|---|
| Developer | Claude Code | your Claude plan |
| Where it lives | Vercel | free to start, about $20/mo for a commercial site |
| Voice | Resend | free tier |
| Ears (optional) | Slack incoming webhook, or whatever your team uses | free |
| Memory (optional) | Google Sheet, or Supabase when you want to build on it | free tier |

## License

MIT. Use it for your business or your clients. Attribution appreciated, not required.

Built by [Lever Agency](https://leveragency.ai), which builds websites and business apps
for small and mid-sized companies.
