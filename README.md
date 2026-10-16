# Care Worker Application — recruitment system (demo edition)

A multi-step care worker application and recruitment pipeline for UK
homecare agencies. It replaces the typical paper-style application form (one
long page, no progress indicator, no save-and-resume, plain text boxes for
phone numbers, dates and yes/no questions).

This version keeps the same information the agency needs, but as an actual
web application: a guided multi-step wizard, proper input types and
validation, autosave so applicants don't lose progress, a review screen
before submission, and a real backend that stores the application and
notifies the team by email and WhatsApp.

> **Generic edition.** No agency is hard-coded: the agency name comes from
> `VITE_BRAND_NAME`, so the same code serves a demo or any client.

## Demo mode (for sales calls)

Set `VITE_DEMO_MODE=true` and the whole app runs in the browser with
fictional sample candidates. No Supabase, Clerk, Blob storage, Resend or
WhatsApp account is needed, so a demo deployment costs nothing to run.

- **Candidate application** and **Staff pipeline** buttons in the dark bar
  at the top switch between the two views (`#/` and `#/admin`).
- The staff pipeline opens with 9 sample candidates spread across every
  stage, including one ready to move to offer (Hannah Clarke) and one whose
  DBS isn't back yet (Sofia Rossi), which shows the DBS-before-offer rule.
- Moves use the real pipeline rules in `src/data/pipeline.ts`. Where the
  live system would email/WhatsApp staff, a note appears bottom-right.
- Uploaded files and new applications are kept in that browser only
  (`localStorage`). **Reset demo** restores the sample data.
- All sample people, emails (example.com), phone numbers (07700 900xxx)
  and documents are invented and watermarked "SAMPLE".

Deploy a demo on Vercel by importing this repo and setting, under
**Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `VITE_DEMO_MODE` | `true` |
| `VITE_BRAND_NAME` | `Demo Homecare Ltd` (or a prospect's name for a tailored demo) |
| `VITE_BRAND_AREA` | `Care worker recruitment` |

To set up the live system for a client instead, leave `VITE_DEMO_MODE`
unset and follow "Required setup" below. Two other new variables:
`REFERENCE_PREFIX` (e.g. `DHC` gives references like `DHC-LX3K2A`) and
`APP_URL` (used for the admin link in staff emails). The Supabase table is
now `care_applications` (see `supabase/schema.sql`).

## What changed vs. the original

- **Multi-step wizard** with a progress bar and section-by-section
  validation, instead of one giant page.
- **Proper input types** — date pickers, `tel`/`email` inputs, dropdowns and
  toggle buttons instead of free-text boxes for structured answers.
- **Inline validation** with accessible error messages (UK postcode, phone
  and National Insurance number formats are checked as you type).
- **Autosave to the browser** (`localStorage`) — closing the tab or losing
  connection doesn't lose progress; there's a "Clear saved draft" option too.
- **Review & edit screen** before submitting, with jump-back links to any
  incomplete section.
- **Repeatable sections** (employment history, education, two references)
  with add/remove controls instead of a fixed number of boxes.
- **Mobile-responsive layout** and no paper-form instructions.
- **A real backend** — submissions are stored in Supabase and trigger an
  email + WhatsApp notification, instead of going nowhere.
- **A staff recruitment pipeline** at `/admin` — right to work check,
  interview, references & DBS, then offer — instead of applications
  disappearing into an inbox with no tracked status.
- **Document upload** for right-to-work evidence and an existing DBS
  certificate, stored privately and viewable only by signed-in staff,
  instead of eligibility being taken on a self-declared word alone.

## Architecture

- `src/` — the React frontend (Vite + TypeScript), deployed as static
  assets. `src/main.tsx` picks between the public application (`App.tsx`)
  and the staff panel (`admin/AdminApp.tsx`) by URL path — there's no
  router dependency, just the one split.
- `api/apply.ts` — a Vercel serverless function. Validates the payload,
  saves it to Supabase, then best-effort sends an email (Resend) and a
  WhatsApp message (Meta Cloud API). A notification failure doesn't fail
  the request, since the application is already safely stored.
- `api/admin/applications/` — serverless functions behind Clerk staff
  sign-in: list applications and progress one through the pipeline
  (`server/adminAuth.ts` verifies the Clerk session token on every call).
- `server/` — the Supabase/email/WhatsApp/auth helpers used by the `api/`
  functions. Kept outside `api/` so they're plain modules, not extra
  routes.
- `src/data/pipeline.ts` — the recruitment pipeline's stages and the only
  place transitions between them are allowed to happen. It's imported by
  both the admin UI (to render the right buttons) and the admin API (to
  enforce the same rules server-side), so the right to work gate can't be
  bypassed by calling the API directly.
- `supabase/schema.sql` — the `care_applications` table, including
  the pipeline columns (`stage`, `rtw_status`, `dbs_status`,
  `stage_history`). Row level security is on with no public policies —
  only the serverless functions' service-role key can read/write it.
- `api/documents/upload.ts` — applicants upload their right-to-work
  evidence (and, optionally, an existing DBS certificate) here before
  submitting. Files are stored in a **private** Vercel Blob store; only the
  pathname is saved on the application, never a public URL.
- `api/admin/applications/[id]/documents/[slot].ts` — the only way to read
  those files back. It's behind the same Clerk staff auth as the rest of
  `/admin`, fetches the blob server-side, and streams it to the browser —
  the private blob URL itself is never exposed to the client.

### Recruitment pipeline

Each submitted application moves through five stages, tracked from
`/admin`:

1. **Right to work check** (default stage on submission) — staff verify
   eligibility documents. This is a hard gate: the only way to reach
   **Interview** is by passing this check here. Failing it closes the
   application immediately, before an interview is ever scheduled.
2. **Interview**
3. **References & DBS** — staff track whether the applicant is applying
   for their own Enhanced DBS check or was sent a link to do so (their
   choice, captured on the application form), until the certificate is
   received.
4. **Offer & onboarding**
5. **Closed** — the exit path from a failed right to work check, a
   rejected interview, or unsatisfactory references/DBS.

The transition rules live in `src/data/pipeline.ts` and are enforced by
`api/admin/applications/[id].ts` on every request — a client can't skip a
stage by sending an unexpected action. Every stage change also triggers a
best-effort email + WhatsApp notification to staff (same channels as a new
submission), so an application doesn't sit untouched.

## Required setup (no secrets are included in this repo)

Copy `.env.example` to `.env.local` and fill these in, or set them directly
in the Vercel project (**Settings → Environment Variables**):

| Variable | Where to get it |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Create a project at [supabase.com](https://supabase.com), run `supabase/schema.sql` in its SQL editor, then copy these from **Project Settings → API**. Use the **service role** key (server-only, never the anon key here). |
| `RESEND_API_KEY`, `NOTIFY_EMAIL_TO`, `NOTIFY_EMAIL_FROM` | Create an account at [resend.com](https://resend.com). You can send from their `onboarding@resend.dev` sandbox address while testing; verify your own domain before relying on this for real applicants. |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `NOTIFY_WHATSAPP_TO` | Create an app at [developers.facebook.com](https://developers.facebook.com), add the **WhatsApp** product. It gives you a free test number, a token and a phone number ID to start with. |
| `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Installed via `vercel integration add clerk` (Vercel Marketplace), which provisions both automatically. In the [Clerk dashboard](https://dashboard.clerk.com), turn off public sign-up and invite staff accounts directly — anyone who can sign in at `/admin` can see and progress every application. |
| `BLOB_READ_WRITE_TOKEN` | Created with `vercel blob create-store <name> --access private --yes`, which provisions and links it automatically. Powers the right-to-work/DBS document uploads — keep the store's access mode **private**. |

Until these are set, submissions fail with a clear "not configured" error
(check `vercel logs`) rather than silently doing nothing, and `/admin`
shows a "not configured" message instead of a sign-in screen.

If you already have this repo's Supabase project set up, re-run
`supabase/schema.sql` in its SQL editor after pulling this change — it
adds the pipeline columns (`stage`, `rtw_status`, `dbs_status`,
`stage_history`) to the existing table and is safe to run again.

**Note on WhatsApp:** Meta's Cloud API only allows freeform text messages
to a number that has messaged your business number in the last 24 hours
(or is added as a tester on the app while in development mode). For a
notification that fires at arbitrary times, you'll eventually want an
approved message template — see Meta's
[message templates docs](https://developers.facebook.com/docs/whatsapp/message-templates)
once you move past testing.

**Note on WHOM to notify:** the env vars above currently point at
whichever email/number you configure — nothing is hard-coded to any agency's
real contact details. Point `NOTIFY_EMAIL_TO` / `NOTIFY_WHATSAPP_TO` at a
client's real inbox/number only once you're authorized to do so.

## Development

```bash
npm install
vercel env pull .env.local   # if env vars are set in the Vercel project
npm run dev                  # frontend only, http://localhost:5173
vercel dev                   # frontend + /api together (needed for /admin)
npm run build                # typecheck + production build to dist/
npm run lint
```

`npm run dev` alone can render `/admin`'s UI but its `fetch` calls to
`/api/admin/*` have nothing to hit — use `vercel dev` to exercise the
pipeline locally.

## Deployment

Import this repo into Vercel; every push to `main` then deploys automatically. A GitHub Actions
workflow (`.github/workflows/ci.yml`) runs lint + typecheck + build on
every push and pull request as a safety check independent of Vercel's own
build.

## Tech stack

React + TypeScript + Vite on the frontend, Vercel serverless functions on
the backend, Supabase (Postgres) for structured storage, Vercel Blob for
private document storage, Clerk for staff sign-in on `/admin`. No UI
framework or form library — plain CSS custom properties for theming and
hand-rolled validation, so the whole data model and every field is easy to
find and edit in `src/`.
