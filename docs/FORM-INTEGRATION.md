# Walkthrough inquiry delivery

## Production flow

Browser → same-origin `POST /api/walkthrough` → Cloudflare Pages Function → server-side validation → Turnstile verification → Resend transactional email acceptance → public confirmation.

Resend acceptance is not a calendar booking or proof that an email reached the inbox. The owner confirmed Cloudflare production credentials are configured for `https://fenrircleaningservice.com`; actual inbox receipt has not been verified in this session.

The receiving code uses Web APIs and has no always-on server or marketing-framework runtime. Replace the email transport in `server/walkthrough.ts` for another delivery provider if desired. Keep the browser contract and server-side validation intact.

The runtime requires `INQUIRIES_ENABLED="true"`; `wrangler.toml` now enables production and keeps preview disabled. It supplies `SITE_ORIGIN=https://fenrircleaningservice.com`. Cloudflare builds of `main` default to production; the browser form is enabled when a production `PUBLIC_TURNSTILE_SITE_KEY` exists unless `PUBLIC_FORM_ENABLED=false` explicitly disables it. Other Cloudflare branches are forced to preview, even if a production marker is inherited.

## Configuration

1. Establish the real domain and the owner’s recipient email.
2. Create a Resend account, verify a sending domain with its required DNS records, and create a sending API key. Store it as `RESEND_API_KEY` in Cloudflare production secrets.
3. Set server-only `INQUIRY_FROM` to a verified sender such as your approved display name and sending address; set `INQUIRY_TO` to the actual owner inquiry inbox. No values have been supplied here.
4. Create a production Cloudflare Turnstile widget restricted to the actual site hostname. Use the public site key in `PUBLIC_TURNSTILE_SITE_KEY`; store the secret as `TURNSTILE_SECRET_KEY`. The widget uses action `request_walkthrough`; the receiver checks success, action, and hostname. Known Cloudflare test secrets are rejected for nonlocal production origins.
5. Set server-only `SITE_ORIGIN` to the actual HTTPS origin, exactly matching the public website (including www if used). Cross-origin and origin-less POSTs are rejected. Add a redirect from alternate domains to the canonical host.
6. For the authorized production activation, set `PUBLIC_FORM_ENABLED=true` or omit it to use the production default. Remove any stale `PUBLIC_DEPLOYMENT_ENV=local` override or set it to `production`. Keep indexing false while verifying delivery. A GitHub push must finish its Cloudflare build before these source changes take effect.

For full Cloudflare local runtime verification after installing Wrangler: build, then run `npx wrangler pages dev dist`. Server secrets can be provided through an ignored `.dev.vars` file per Cloudflare’s local-development documentation. Never commit this file. The source’s regular `npm run preview` command does not emulate Functions.

## Request contract

JSON UTF-8, maximum 14,000 bytes. All field values are strings unless otherwise noted. Unknown fields are ignored and never forwarded.

| Field | Requirement | Maximum / choices |
|---|---|---|
| `contactName` | Required | 150 characters |
| `businessName` | Required | 150 characters |
| `town` | Required | Bailey, Conifer, Evergreen |
| `phone` | Phone or email required | 10–15 digits; common punctuation allowed |
| `email` | Phone or email required | Valid address, 150 characters |
| `businessAddress` | Optional | 300 characters |
| `businessType` | Optional | Office / professional workspace; Retail shop / showroom; Studio / community space; Commercial common area; Other |
| `squareFootage` | Optional | Not sure; Under 1,000 sq ft; 1,000–2,500 sq ft; 2,500–5,000 sq ft; 5,000–10,000 sq ft; Over 10,000 sq ft |
| `frequency` | Optional | Help me decide; Once a week; Twice a week; Three times a week; Other / let’s discuss |
| `preferredContact` | Optional | Either is fine; Phone; Email. Selected method requires its contact field. |
| `message` | Optional | 2,000 characters; no keys, codes, payments, or sensitive building information |
| `website` | Honeypot | Empty |
| `startedAt` | Required number | Page-open epoch milliseconds; 2 seconds to 24 hours before receipt |
| `requestId` | Required | UUID v4; retained across retries |
| `turnstileToken` | Required | Single-use token; maximum 2,048 characters |

## Responses and failure behavior

- `200 { "accepted": true, "id": "<provider receipt>" }` only after the provider returns a nonempty accepted identifier.
- `422` includes safe field errors or an anti-abuse message. The form displays errors next to their fields and links to fields from a focused summary.
- `400 / 403 / 405 / 413 / 415` reject malformed, cross-origin, unsupported, excessive, or incorrect-content-type requests.
- `502` means security/delivery could not be confirmed. `503` means receiving configuration is unavailable. No false receipt is shown.
- Browser input stays in the page after validation, network, or provider errors. It is never saved to browser storage. The security widget resets for retry.
- A UUID and SHA-256 hash of the inquiry’s email payload form the provider’s idempotency key. An unchanged retry uses the same key; changed content uses a different key.

The server sends plain-text email to a fixed configured recipient, uses the inquirer’s validated email only as `reply_to`, and never logs inquiry bodies or secrets. There is no automatic CRM integration. A future safe lead import can map the stable business fields above; the anti-abuse fields are not lead data.

## Spam controls

Production requires server-verified Turnstile with matching hostname and action. Other controls include a honeypot, elapsed-time checks, exact-origin checks, restricted types/lengths/choices, a streamed request-body limit, request timeouts, and idempotency. Cloudflare WAF/rate-limiting rules for `POST /api/walkthrough` can be added on the chosen account/plan if abuse warrants it; no unconfigured rate-limit binding is assumed.

## Controlled verification

`npm run qa:build` writes **only** `.qa-dist`. `npm run test:e2e` starts a separate loopback QA adapter on 4180 and a real HTTP test receiver on 4181. The production handler’s fetch dependency routes verification/email calls to that receiver. The browser’s test-only Turnstile script returns a synthetic token. This is intentionally a test double, not a live Turnstile verification.

The receiver returns a failure for the synthetic `Reject Test` business and accepts other test payloads with a receipt. Browser tests verify retained fields, then successful acceptance and the receiver’s actual payload. `test-results/controlled-receipts.json` contains synthetic test evidence only. Production code contains no environment switch for a test receiver or CAPTCHA bypass, and QA assets never enter `dist/`.

Official references: [Turnstile server verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Resend idempotency](https://resend.com/blog/engineering-idempotency-keys), [Cloudflare Functions routing](https://developers.cloudflare.com/pages/functions/routing/).

## Actual recipient acceptance test — NOT RUN

The verified public phone is 303-513-4389 and the confirmed live domain is `fenrircleaningservice.com`. The owner reports that provider and spam-protection configuration exists in Cloudflare. Controlled receiver acceptance and provider HTTP acceptance are separate from intended-inbox receipt; this session has not verified real inbox delivery.

When configuration is available and a protected deployment/test is authorized:

1. Configure the real canonical origin, direct contact, verified sending domain, recipient, Resend key and production Turnstile widget as described in DEPLOYMENT.md. Store secrets using Cloudflare, never in source or command arguments.
2. Keep indexing false. Use an access-protected production-context deployment; retain the normal preview environment's disabled settings. Enable the server switch only after configuration exists; enable the browser form for this protected test.
3. Submit a small clearly identified test inquiry through the actual browser widget and deployed /api/walkthrough route. Confirm the successful provider acceptance identifier without printing credentials or private inquiry content.
4. Have the intended recipient confirm the message actually arrived in the intended inbox, with complete field content and working reply-to behavior. Check spam/quarantine and sender-domain authentication. A provider ID alone does not pass this step.
5. Test a controlled delivery failure, field preservation, and verified direct-contact fallback; restore the working receiver and confirm another real receipt.
6. Record the test date, configured environment, redacted provider reference, and recipient confirmation in a private operational record outside Git. Update VERIFICATION.md with a redacted passed/not-passed status only after evidence exists.
7. The owner has authorized the form activation and GitHub push. Indexing is a separate setting and remains off by default.

No step above has been represented as completed in the current review.
