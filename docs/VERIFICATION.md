# Verification report — November 3, 2026

## Approved production public key wired into the build

Cloudflare successfully deployed commit `fc82c6d`. A live read confirmed the approved key, enabled form, zero disabled fieldsets and the Turnstile script. A subsequent empty validation-only POST returned 503, so runtime receiving was not declared working. The configuration endpoint now reports missing setting names only, to identify the remaining Cloudflare runtime binding without exposing private values. No real inquiry was sent.

The owner supplied `PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAFxSr9EAi6JGFWTA`. The production `[vars]` table now contains that public value plus `PUBLIC_DEPLOYMENT_ENV=production` and `PUBLIC_FORM_ENABLED=true`. Existing `INQUIRIES_ENABLED=true` and `SITE_ORIGIN=https://fenrircleaningservice.com` are preserved. Preview explicitly keeps both flags false and its public key blank. No private credential or `TURNSTILE_SECRET_KEY` value was changed.

`npm run build` now launches Astro through a wrapper that parses Wrangler TOML and supplies only the three public build defaults when absent from the production build environment. This is an explicit build-time bridge, independent of Function bindings. Other production variables and explicit overrides are preserved, and invalid/blank overrides still fail the existing launch checks. The TOML parser was already installed transitively; it is now declared directly without changing its resolved version.

The actual production-context `npm run build`, with all three public inputs absent, was checked for the approved key, `data-enabled="true"`, the `/api/walkthrough` action, enabled fieldsets and the Turnstile script. All 29 unit tests, real production/preview build checks, type checks, Function bundles, public-output audit, and three desktop/tablet/phone controlled submission checks pass. No real inquiry was sent; inbox delivery remains unverified.

## Production diagnosis after GitHub connection repair

Inspected base `098eabb` and the successful Cloudflare Pages check for project `fenrir-ccs-website`. The live page rendered `data-enabled="false"`, `data-runtime-config="true"`, an empty public widget key and two disabled fieldsets. Its runtime configuration endpoint returned `{ enabled: false }`. An empty same-origin POST returned 422 with required-field errors, proving the receiver's enablement/origin/credential-presence checks passed. It did not call Turnstile or Resend, and it did not send email. Inbox delivery remains unverified; domain verification and configured private keys are owner-reported facts.

The confirmed disabling condition is that no usable public widget key reaches the form. The build required environment production, flag true, and a nonempty `PUBLIC_TURNSTILE_SITE_KEY`; an empty key silently evaluated false. The rendering then disabled both fieldsets, hid the submit button via CSS, omitted Turnstile's script and showed phone contact. The runtime fallback also needs a public site key. Configuring the private `TURNSTILE_SECRET_KEY` cannot supply either public-key input.

Repository fixes: align Wrangler's project name with `fenrir-ccs-website`; fail a requested production build with a specific `PUBLIC_TURNSTILE_SITE_KEY` error for blank keys; trim public values; reject local/preview/QA and form-off overrides on Cloudflare main instead of publishing disabled form HTML; and isolate QA builds from inherited Cloudflare branch markers. There is no `[env.production]` override switching inquiries off. Top-level runtime vars remain `INQUIRIES_ENABLED=true` and `SITE_ORIGIN=https://fenrircleaningservice.com`; the preview override remains false. Only `.env.example` exists locally, and its local review defaults are not loaded as a production dotenv file. The normal build script does not set disabling public flags. Server validation and Turnstile verification are unchanged. Private keys stay in Cloudflare.

Checks passed: 26 unit tests, Astro/server type checks, both Function bundles, local build/public-output audit, isolated QA build with inherited Cloudflare preview markers, and nine desktop/tablet/phone form browser checks. `npm run check:production` additionally builds real production and preview HTML with synthetic public inputs: production fields and widget enabled, preview fields disabled, and a missing-key production build rejected. None of these checks proves real email delivery. Required public build settings and runtime bindings are mapped in DEPLOYMENT.md.

## Runtime form activation

After the owner updated Cloudflare, a live empty validation-only POST returned 422 with required-field errors, confirming the receiver was configured and enabled; the page still rendered disabled fields and no widget. No inquiry or email was sent. The website now supports fetching public widget configuration at runtime and enabling the form when the configured canonical receiver is ready. The endpoint returns only readiness and the public site key; no email credentials or recipient details are exposed. Missing runtime configuration preserves phone contact. The earlier build-time activation and historical evidence below are retained for context.

Validation passed: 25 unit tests, Astro/server type checks, production and isolated QA builds, public-output audit, and compilation of both Cloudflare routes. Nine desktop/tablet/phone browser checks passed, including activation without a build-time key, disabled-runtime fallback, accessibility, field validation, delivery failure recovery and controlled HTTP acceptance. These use synthetic test providers and do not establish real inbox delivery.

## Production contact-form activation

The owner confirmed `https://fenrircleaningservice.com` is hosted on Cloudflare with email and spam-protection credentials already configured there, and requested form activation plus a GitHub commit/push. Before this change, a live read showed `data-enabled="false"` and an empty validation-only POST returned 503; no inquiry or email was sent.

`wrangler.toml` now enables the production receiver and sets its origin to the confirmed domain; preview remains disabled. Cloudflare `main` builds default to production, use the confirmed canonical origin, and enable the browser form when a real public Turnstile key is configured. Explicit public build overrides are still respected. Server-only Cloudflare build markers are read explicitly, and other branches are forced to preview. Secrets remain in Cloudflare.

Validation includes 23 unit tests, Astro/server type checks, audited local and isolated QA builds, Function compilation, and browser validation/failure/success checks at desktop, tablet and phone sizes. A production-context build also confirms that the configured form and canonical origin reach the generated HTML; its synthetic public key exists only in ignored validation output. These checks do not establish real inbox receipt. The live deployment is checked separately after the push.

## Owner-supplied logo and portrait update

The three files supplied in `Logo_and_Owner/` are applied to the local website. The full transparent logo appears in the header, the light-background version appears in the footer, and crops of the supplied emblem replace the provisional hero seal and favicon. Blake's portrait replaces the illustrative landscape on the homepage and About page, preserving its square composition with descriptive alt text and an owner caption.

The originals remain in place. Source copies and a lossless PNG conversion of the portrait feed Astro's responsive WebP optimization. The PNG-only decoder policy remains in force. Asset provenance and the launch checklist are updated.

Validation: production build and public-output audit passed (40 permitted files, 14 optimized WebP variants); Astro/server type checks passed (40 files, no errors, warnings, or hints); all 22 existing unit tests passed. All 12 relevant browser checks passed across desktop, tablet and phone: page routes, images, internal links, accessibility, navigation, keyboard access, narrow layouts and JavaScript-disabled menus. Screenshots were reviewed for the new header, owner sections and footer. The initial browser run encountered a transient 404 while the preview was being rebuilt; the complete 12-check run passed against the finished build. Owned preview servers were stopped manually after the checks to complete runner teardown in this Windows environment. No hosting publication was performed.

The owner subsequently authorized a GitHub commit and push. With the required environment access, GitHub's `main` was verified at `229383165c01a44fe40946e120c8f936cfdffa05`, matching the local base, and `origin` was configured to `https://github.com/Blakebannon/Fenrir_CCS_Website.git`. The earlier access restrictions below describe the previous environment state.

## Earlier repository verification

The following records describe the earlier repository preparation, before the owner supplied the assets above. At that stage, the established layout, warm mountain-town palette, imagery, self-hosted fonts and provisional Nordic wolf/ridgeline mark were preserved because the exact separately approved original logo had not yet been supplied. The asset update above supersedes that earlier branding state.

Confirmed information is applied: Fenrir Commercial Cleaning Service, Blake Bannon, 303-513-4389, Bailey/Conifer/Evergreen, and Red Rocks Technology Group LLC d/b/a Fenrir Commercial Cleaning Service. The LLC is identified in the footer, privacy information and structured data. Phone links use `tel:+13035134389`.

Copy explains owner operation, generally one to three visits weekly, per-visit pricing based on walkthrough/cleanable square footage/frequency/condition/scope, and a written scope and quote before work. No unsupported insurance, bonding, licensing, certification, testimonials, customer history or guarantees are published.

**Not pushed to GitHub. Not deployed or operating in production.** Online inquiries and indexing remain disabled; a clear phone option is available.

## Checks performed

Runtime: Node 25.9.0, npm 11.12.1; installed packages/lockfile retained.

| Check | Observed result |
|---|---|
| Astro and strict server TypeScript | Passed: 39 checked files; zero errors, warnings or hints |
| Application/receiver/launch/image tests | 22 passed; zero failures/skips |
| Production build | Passed: four primary pages plus custom 404; 13 responsive WebP variants (existing optimized cache reused) |
| Public-output audit | Passed: 40 permitted files, 2,869,907 bytes; no server secret names/available configured secret values or private documents found |
| Cloudflare Function bundle | Passed with Web APIs and workspace-only imports; not a hosted runtime test |
| Isolated QA build | Passed; reserved contacts/test widget confined to .qa-dist |
| Full desktop/tablet/phone browser suite after repair | 18 passed; zero unexpected, skipped or flaky results; no report-level errors |
| Visual review | All four pages inspected at desktop and phone sizes; controlled error/success views also inspected |
| Secret/exclusion scan | Passed for nonignored candidate source/assets/docs; staging is blocked, so no staged-file scan is claimed |
| Manifest/lockfile | Dependency declarations agree; all resolved package URLs use registry.npmjs.org; no package upgrade installed |
| Fresh npm audit/outdated/update | Failed due registry/network access restrictions; no current comprehensive audit or successful clean installation claimed |
| Git remote inspection/staging/commit/push | Blocked by GitHub connectivity and denied Git metadata writes; no remote SHA verified |

The initial browser run found a JavaScript-disabled menu regression caused by the wider-header navigation rules. The CSS fallback was repaired, both builds regenerated, and the complete 18-test suite passed. It covers:

- Four pages, all internal links/hash destinations, one H1 per page, loaded images and no page JavaScript errors.
- Primary walkthrough action, menu toggle/close/Escape, FAQ, skip link and keyboard focus, including mobile navigation without JavaScript.
- Exact production phone href/text on every page and no guessed mail links.
- Automated WCAG 2 A/AA and 2.1 AA scans at desktop (1440), tablet (820) and phone (390).
- Horizontal overflow at 320, 1024, 1100 and 1280 pixels; enlarged text and reduced motion.
- Clear phone fallback, disabled fields/no submit action, and no external security widget in the unconfigured build.
- Controlled form validation, preferred-contact rules, failure field preservation, focused status and successful synthetic receiver acceptance.

The successful full run was observed in console output and its JSON statistics (18 expected; zero skipped, unexpected or flaky; zero report errors). The later focused test clears Playwright's output directory, so the full raw JSON is not retained; `test-results/browser-results.json` now records that focused run. `review/screenshots/` contains current views. These artifacts are ignored because they include local paths/runtime details. Earlier retained result JSONs are historical, not this run's evidence. This restricted Windows environment required manually stopping owned loopback servers during runner teardown. The browser configuration launches Node entry points directly and supports browser path selection across platforms. The focused desktop CTA/menu/keyboard check passed after the harness change; this did not resolve the environment's teardown limitation.

## Delivery and launch configuration

Controlled tests route the production handler's injected fetch dependency to a real HTTP receiver on loopback. Turnstile and Resend are substituted; accepted payloads and failures are checked using reserved synthetic data. These are **simulated provider tests**, not live verification or intended-inbox receipt. No messages were sent to a real person.

Server tests cover origin checks, missing configuration, independent runtime disable switch, known test-key rejection, body/type/size limits, field/enumeration validation, honeypot/timing, security verification, provider/network rejection and content-bound idempotency. The receiving source and Cloudflare adapter remain in the complete project.

No verified domain, public business email, owner-controlled recipient, verified sender, provider key or production Turnstile setup exists in the project or relevant process configuration. No actual delivery test could be performed. The runtime and public build inquiry switches remain false. Preview mode forcibly disables submission and indexing. The phone contact remains usable without an environment file.

No domain was invented. Pages emit noindex/nofollow; robots.txt emits Disallow: /; the sitemap contains zero URLs until a real HTTPS origin is supplied. Canonical/sitemap generation is covered by tests using reserved origins. The structured data uses the service-area model, confirmed phone and founder, and no invented street address, opening hours, ratings or prices.

Cloudflare routing, security headers and Wrangler configuration were inspected. Function compilation is verified; Wrangler emulation, hosted routing/header application, actual widget verification and inbox receipt are not. No hosting publication, Pages activation, purchase or DNS change was made.

Cleaning-specific insurance is still being arranged. Credential claims remain empty and subject to verification/publication approval. Private evidence does not belong in this repository.

## Dependencies

Installed unresolved versions remain Astro 6.4.8, Sharp 0.34.5 and esbuild 0.27.7. Fresh registry audit/outdated/update attempts failed (including EACCES). The manifest/lockfile were not changed to pretend a fix was installed. Only the supported npm engine declaration was synchronized.

Maintainer advisory lists were rechecked, including additional Astro/Node/Deno entries and their applicability. Historical counts are identified as historical; no comprehensive current count is asserted. See DEPENDENCIES.md for primary references, implementation assessments and remaining remediation.

The PNG-signature guard, PNG-only native decoder policy, static-only output and isolated handler are preserved. Image-policy tests pass. These measures limit applicable exposure; they do not constitute upstream fixes or a clean audit.

## Repository preparation and external blocker

No AGENTS.md was present in the project or inspected ancestor locations. Existing project documentation, source, assets, scripts, handler and configuration were reviewed. No local Git repository existed initially; there was no prior local history or configured remote to preserve. All existing project files remain in place.

Git initialization on main succeeded. Adding the requested origin then failed: `.git/config` could not be locked (Permission denied). Staging failed creating `.git/index.lock` (Permission denied). Repeated `git ls-remote` calls to the requested destination failed connecting to github.com:443. The browser access host was also unavailable; web retrieval could not establish repository state. Remote branches/history are unknown, so no unsafe integration/push was attempted.

Destination: https://github.com/Blakebannon/Fenrir_CCS_Website.git.
Local branch: main, unborn. Remote configured: none (write failed). Commit SHA: none. Pushed branch/SHA: none.

The complete candidate file set includes source, originals, branding study/provenance, fonts' license records, public assets, Function/server code, package/lockfile, configuration, tests and documentation. Generated dist/ is ignored and reproducible with the documented install/build commands when registry access is available. Private environment files, caches, dependencies, runtime reports, keys, databases, customer/prospect material and internal business documents are excluded. No private business documents were added to public assets.

To finish the authorized GitHub work, this workspace needs write access to its Git metadata plus authenticated GitHub network access. Then inspect destination branches/history, preserve and integrate any existing remote work, stage/review/scan, create a meaningful commit and push without force. Verify the resulting remote SHA. This is an environment-access prerequisite, not a request for additional publishing authorization. Hosting remains outside the authorized task.

Remaining production setup is recorded in LAUNCH-CHECKLIST.md, DEPLOYMENT.md and FORM-INTEGRATION.md.
