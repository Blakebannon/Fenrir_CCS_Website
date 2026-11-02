# Verification report — November 2, 2026

## Result

The four-page website is updated and verified locally. The established layout, warm mountain-town palette, imagery, self-hosted fonts and current Nordic wolf/ridgeline mark are preserved. The exact separately approved original logo was not identified among available files; no replacement identity was invented.

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
