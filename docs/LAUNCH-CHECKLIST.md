# Launch checklist — November 2, 2026

No hosting publication or DNS changes are authorized by this repository task. Online inquiries and indexing remain off. Keep private values out of source, screenshots and logs.

| Item | Required configuration / decision | Current state |
|---|---|---|
| Business identity | Fenrir Commercial Cleaning Service; Blake Bannon; Bailey, Conifer and Evergreen, Colorado | Applied across the site |
| Legal provider | Red Rocks Technology Group LLC d/b/a Fenrir Commercial Cleaning Service | Footer, privacy and structured data |
| Public phone | 303-513-4389; `tel:+13035134389` | Available without environment setup |
| Approved original logo | Use the exact approved Nordic wolf/ridgeline file when positively identified | No separate approved original identified; current native mark preserved |
| Production domain | HTTPS origin in PUBLIC_SITE_URL, matching SITE_ORIGIN and widget hostname | Not supplied; no invented canonical; empty sitemap; noindex/disallow |
| Public email | Verified address only in PUBLIC_BUSINESS_EMAIL | Not supplied; phone available |
| Inquiry recipient | Owner-controlled inbox in server-only INQUIRY_TO | Not supplied |
| Delivery | Verified sending domain, RESEND_API_KEY, approved INQUIRY_FROM | Not configured |
| Spam protection | Hostname-restricted Turnstile widget; public site key and server secret | Not configured; protective checks preserved |
| Insurance / credentials | Confirm current coverage and approve exact wording before adding claims | Cleaning-specific insurance being arranged; claims omitted |
| Dependencies | Fresh successful audit and compatible remediation; retain image safeguards | Registry access blocked; unresolved packages in DEPENDENCIES.md |
| Cloudflare | Choose account/project/branch; build from full source including functions/, output dist/ | Prepared; hosted runtime unverified; no deployment |
| Real delivery | Authorized protected noindex deployment; actual widget/Function; inbox receipt and failure recovery | Not run; controlled tests do not count as inbox receipt |
| GitHub | Inspect remote history, stage/scan, commit, non-force push | Blocked by Git metadata permissions and connectivity; no commit/push verified |

Current values: PUBLIC_FORM_ENABLED=false, PUBLIC_ALLOW_INDEXING=false, INQUIRIES_ENABLED="false" in production and preview Wrangler scopes. PUBLIC_DEPLOYMENT_ENV defaults to local. The contact page offers a phone action while online submission is disabled.

When configuration and separate deployment authorization are available, follow DEPLOYMENT.md and FORM-INTEGRATION.md. Domain, delivery, dependency remediation and actual inbox verification precede activation. GitHub publication and hosting publication are separate actions.
