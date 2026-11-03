# Fenrir Commercial Cleaning Service

Owner-operated commercial cleaning by Blake Bannon, serving Bailey, Conifer, and Evergreen, Colorado. Public phone: **303-513-4389**. Legal service provider: Red Rocks Technology Group LLC d/b/a Fenrir Commercial Cleaning Service.

Complete Astro + TypeScript website and separate Cloudflare Pages inquiry handler. The four primary pages are `/`, `/about`, `/request-walkthrough`, and `/privacy`, with a custom 404. Owner-supplied Fenrir logos and Blake's portrait, illustrative workplace imagery, self-hosted fonts, and licenses are retained.

## Installation and local preview

Supported runtime: **Node >=22.12.0, npm >=9.6.5**. Latest checks used Node 25.9.0 and npm 11.12.1. Use `npm.cmd` in Windows PowerShell if execution policy blocks `npm.ps1`; use `npm` on other systems.

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run preview
```

Open **http://127.0.0.1:4173**. Development: `npm.cmd run dev`, then open its printed URL. No environment file is needed for the phone-enabled local build.

`dist/` is generated and ignored. A fresh clone reproduces it through `npm ci` and `npm run build` with registry access. Commit the manifest and lockfile together when changing dependencies. This session could not retest a fresh install because registry access is restricted; verification used the installed tree. Deploy from full source including `functions/` and supporting server code. Uploading only `dist/` does not deploy the inquiry Function.

## Launch state

Phone contact uses `tel:+13035134389`. Recurring service generally runs one to three visits per week. Pricing is per visit after a walkthrough, considering cleanable square footage, frequency, condition and agreed scope. A written scope and quote precede work.

The owner confirmed the live website is **https://fenrircleaningservice.com**, hosted on Cloudflare, with email and spam-protection credentials configured there. Production inquiries are enabled in `wrangler.toml`; Cloudflare builds of `main` default to the production environment and enable the form when `PUBLIC_TURNSTILE_SITE_KEY` is configured. Public build overrides control the initial markup; the runtime configuration below can activate a page built without the public key. Set `INQUIRIES_ENABLED=false` to disable the receiver and runtime activation. Indexing remains off by default. Local review and branch previews keep submissions disabled. Real inbox receipt must be checked separately; configured keys are not stored in this repository.

Cleaning-specific insurance is being arranged. No insurance, bonding, licensing, certification, customer, review or operating-history claims are configured. The logos and owner portrait supplied in `Logo_and_Owner/` are applied across the website. See [asset records](docs/ASSETS.md).

## Source and configuration

- `src/config/business.ts`: brand, owner, legal provider, towns, phone actions and optional verified evidence.
- `src/config/launch.ts`: build flags, canonical/sitemap policy and confirmed default phone.
- `src/pages/`, `src/components/`, `src/styles/`: pages and responsive presentation.
- `src/assets/`, `public/`: original images, owner-supplied branding, generated mark/favicon, public assets and font licenses. Fontsource packages install from the lockfile; fonts are bundled locally.
- `src/lib/inquiry.ts`, `src/scripts/walkthrough.ts`: validation and accessible browser behavior.
- `server/walkthrough.ts`, `functions/api/walkthrough.ts`: server validation, Turnstile and Resend.
- `wrangler.toml`, `public/_headers`, `public/_routes.json`: Cloudflare build, security and routing.

Copy sanitized `.env.example` to ignored `.env` only when configuring a build. Public variables are `PUBLIC_DEPLOYMENT_ENV`, `PUBLIC_SITE_URL`, `PUBLIC_ALLOW_INDEXING`, `PUBLIC_BUSINESS_PHONE`, `PUBLIC_BUSINESS_EMAIL`, `PUBLIC_FORM_ENABLED` and `PUBLIC_TURNSTILE_SITE_KEY`. The confirmed phone is the default; unverified contact values stay empty.

Server bindings are `INQUIRIES_ENABLED`, `SITE_ORIGIN`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `INQUIRY_FROM` and `INQUIRY_TO`. Private values belong in Cloudflare secrets or ignored `.dev.vars` for local Functions testing, never public-prefixed variables. The production runtime switch is true and its origin is `https://fenrircleaningservice.com`; preview stays false. Astro preview serves static pages and does not emulate Functions.

The live form can also activate from Cloudflare runtime settings when its public key was unavailable during the static build. `GET /api/walkthrough/config` returns only readiness and the public `PUBLIC_TURNSTILE_SITE_KEY` (or `TURNSTILE_SITE_KEY` alias), after checking that receiving is enabled and configured for the request's origin. The browser then enables the fields and loads Turnstile. Missing configuration retains the phone fallback; email credentials and recipient details are never returned.

Cloudflare Pages project `fenrir-ccs-website` builds production from `main`. The approved public widget key and production flags are configured in `wrangler.toml`. `npm run build` explicitly passes those three public defaults into Astro through `scripts/build-site.ts`; Function runtime bindings alone do not supply the frontend. Existing Cloudflare build overrides and all other variables are preserved. Blank or invalid overrides still fail the launch checks. Local review and preview branches receive no production defaults, and preview inquiries remain disabled. See the five-setting build/runtime map in [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Verification

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run check:function
npm.cmd run check:production
npm.cmd run build
npm.cmd run qa:build
npm.cmd run test:e2e
```

Browser tests use installed Windows Google Chrome when present, otherwise Playwright Chromium. On a fresh machine, install it with `npx playwright install chromium`, or set `PLAYWRIGHT_EXECUTABLE_PATH` to an existing browser. The configuration supports Windows and other platforms.

Tests cover all pages, links, phone actions, keyboard access, automated WCAG checks, responsive layouts and form validation/failure/success. Production preview uses 4173, isolated QA uses 4180, and a synthetic HTTP receiver uses loopback port 4181. Reserved contacts and a substituted widget are confined to QA. **These simulate providers; they do not verify actual Turnstile, Resend, Cloudflare or inbox delivery.** Screenshots and results are ignored local artifacts.

Before committing, inspect and stage intended files, then run `npm.cmd run check:secrets` and `git diff --cached --check`. If staging is unavailable, `npm.cmd run check:secrets -- --worktree` checks nonignored candidates. Findings show filenames and variable/category names only. This focused scan does not replace file review. Private environment files, caches, build output, keys, databases and private business/customer documents are excluded by `.gitignore`.

Evidence and limits: [VERIFICATION.md](docs/VERIFICATION.md). Registry restrictions block fresh dependency audit/update requests; Astro 6.4.8, Sharp 0.34.5 and esbuild 0.27.7 remain unresolved. Restricted PNG decoding stays in place. See [DEPENDENCIES.md](docs/DEPENDENCIES.md); no clean audit or package upgrade is claimed.

## Repository and later deployment

Repository: https://github.com/Blakebannon/Fenrir_CCS_Website.git, configured as `origin`. Before committing the owner-supplied image update, the local base commit `2293831` was verified to match GitHub's `main`. Preserve existing history, review staged files, run the secret check, and use normal pushes. Earlier environment-access limitations are recorded in the historical verification notes.

Start with [LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md), then [DEPLOYMENT.md](docs/DEPLOYMENT.md) and [FORM-INTEGRATION.md](docs/FORM-INTEGRATION.md). The existing Cloudflare site must finish deploying the pushed source before form activation takes effect. No GitHub Pages activation, purchases or DNS changes are part of this update.
