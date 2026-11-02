# Launch checklist — November 2, 2026

The owner authorized enabling the request form on the existing Cloudflare site and committing/pushing the source update. Indexing stays off by default. Keep private values out of source, screenshots and logs.

| Item | Required configuration / decision | Current state |
|---|---|---|
| Business identity | Fenrir Commercial Cleaning Service; Blake Bannon; Bailey, Conifer and Evergreen, Colorado | Applied across the site |
| Legal provider | Red Rocks Technology Group LLC d/b/a Fenrir Commercial Cleaning Service | Footer, privacy and structured data |
| Public phone | 303-513-4389; `tel:+13035134389` | Available without environment setup |
| Approved original logo | Owner-supplied originals in Logo_and_Owner | Transparent logo in header; light-background version in footer; matching emblem and favicon |
| Owner portrait | Owner-supplied Blake Bannon image | Applied to homepage and About page with responsive WebP sizes |
| Production domain | HTTPS origin in PUBLIC_SITE_URL, matching SITE_ORIGIN and widget hostname | https://fenrircleaningservice.com, confirmed by owner and live site |
| Public email | Verified address only in PUBLIC_BUSINESS_EMAIL | Not supplied; phone available |
| Inquiry recipient | Owner-controlled inbox in server-only INQUIRY_TO | Existing Cloudflare configuration reported by owner |
| Delivery | Verified sending domain, RESEND_API_KEY, approved INQUIRY_FROM | Existing Cloudflare configuration reported by owner; inbox receipt not verified here |
| Spam protection | Hostname-restricted Turnstile widget; public site key and server secret | Existing Cloudflare configuration reported by owner; protective checks preserved |
| Insurance / credentials | Confirm current coverage and approve exact wording before adding claims | Cleaning-specific insurance being arranged; claims omitted |
| Dependencies | Fresh successful audit and compatible remediation; retain image safeguards | Registry access blocked; unresolved packages in DEPENDENCIES.md |
| Cloudflare | Build from full source including functions/, output dist/ | Existing live website; production activation follows the GitHub push |
| Real delivery | Authorized protected noindex deployment; actual widget/Function; inbox receipt and failure recovery | Not run; controlled tests do not count as inbox receipt |
| GitHub | Inspect remote history, stage/scan, commit, non-force push | origin configured; local base 2293831 verified against GitHub main before the owner-supplied image update |

Production values: INQUIRIES_ENABLED="true", SITE_ORIGIN="https://fenrircleaningservice.com"; PUBLIC_FORM_ENABLED defaults true in production when a public site key is set. An explicit false overrides it. Cloudflare main defaults to production; other branches are forced preview. Local review and preview submissions remain off. Indexing remains false by default.

When configuration and separate deployment authorization are available, follow DEPLOYMENT.md and FORM-INTEGRATION.md. Domain, delivery, dependency remediation and actual inbox verification precede activation. GitHub publication and hosting publication are separate actions.
