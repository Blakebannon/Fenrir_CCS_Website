# Cloudflare deployment and production contact form

## Production form configuration

Pages project: **fenrir-ccs-website**, GitHub repository **Blakebannon/Fenrir_CCS_Website**, production branch **main**. `wrangler.toml` uses this project name.

| Setting | Required production value | Read when / configured in |
|---|---|---|
| PUBLIC_DEPLOYMENT_ENV | production | wrangler.toml `[vars]`; explicitly copied into Astro by the build wrapper |
| PUBLIC_FORM_ENABLED | true | wrangler.toml `[vars]`; explicitly copied into Astro by the build wrapper |
| PUBLIC_TURNSTILE_SITE_KEY | 0x4AAAAAAFxSr9EAi6JGFWTA | wrangler.toml `[vars]`; explicitly copied into Astro by the build wrapper |
| INQUIRIES_ENABLED | true | Pages Function runtime; tracked top-level `[vars]` in wrangler.toml |
| SITE_ORIGIN | https://fenrircleaningservice.com | Pages Function runtime; tracked top-level `[vars]` in wrangler.toml |

The public site key and `TURNSTILE_SECRET_KEY` are different values. Runtime `vars` do not automatically become Astro build inputs. The `npm run build` command now calls `scripts/build-site.ts`, which parses the production `[vars]` table and copies only the three public settings above into Astro's child-process environment. It applies to Cloudflare main and explicit local production-context builds. It does not inject production defaults into local review, QA, or preview builds. Existing Cloudflare build variables are preserved; an explicit incorrect/blank override still fails the existing launch checks. Normally no separate Cloudflare public build setting is required. Private `RESEND_API_KEY`, `INQUIRY_FROM`, `INQUIRY_TO`, and `TURNSTILE_SECRET_KEY` stay unchanged in Cloudflare. The preview runtime switch remains false, with the public key explicitly blank.

Previously, an empty public key made `formEnabled` false without failing the production build. This rendered disabled fieldsets, hid the submit button through CSS, omitted the widget script, and left the phone fallback visible. Runtime activation also requires a public widget key. Production builds requesting the form now fail with a specific setting error when that key is blank. A local/preview/QA marker or `PUBLIC_FORM_ENABLED=false` on Cloudflare main also fails explicitly; actual preview branches are still forced off. The QA build clears inherited Cloudflare branch markers before its isolated test build.

`npm run check:production` runs the build wrapper without public environment inputs and confirms that the generated production HTML contains the real approved public key, enabled fields, the submission action, and the Turnstile script. It also verifies disabled previews and rejection of an explicitly blank production key. Output is ignored in `.cache`; no private keys or provider calls are used. A successful build is not evidence of inbox delivery.

The owner confirmed the live Cloudflare site at `https://fenrircleaningservice.com` and existing production email/Turnstile credentials. The requested source activation enables production inquiries and supplies that origin. Cloudflare `main` builds default to production and enable the public form when the public Turnstile key exists; `PUBLIC_FORM_ENABLED=false` and `PUBLIC_DEPLOYMENT_ENV=local` remain explicit overrides that must be removed or changed in Cloudflare if present. Other branch builds remain disabled previews. Earlier setup guidance below is retained for maintaining the deployment.

## Structure confirmed locally

| Location | Actual role |
|---|---|
| astro.config.mjs | Static Astro output and restricted PNG image service. No SSR adapter/server. |
| dist/ | Static pages/assets, custom 404, headers, routes, robots and sitemap. |
| functions/api/walkthrough.ts | Pages file-routing entry point at **/api/walkthrough**, exporting onRequest. |
| server/walkthrough.ts | Shared Web API receiver, Turnstile verification and Resend transport. No Astro/Sharp/esbuild/Node service or CRM runtime. |
| public/_routes.json | Function invocation limited to /api/*; marketing routes are static. |
| wrangler.toml | Pages output ./dist, compatibility date, production inquiries enabled with the confirmed origin; preview inquiries disabled. Not a Worker main configuration. |

The entry point is type-checked, invoked by tests, and bundled by `node scripts/check-function.mjs`. This confirms structure/local compilation. **Wrangler emulation and a hosted Cloudflare deployment have not been tested.** A static file upload alone cannot provide the POST endpoint.

## Required build settings

- Root directory: this repository root, including both src/ and functions/.
- Install from package-lock.json. Build: **npm run build**. Output: **dist**.
- Pages V2 build system or later. Supported runtime: Node >=22.12.0, npm >=9.6.5. Local checks use Node 25.9.0 and npm 11.12.1. Recheck requirements when migrating dependencies; no migration is installed.
- Use Pages project `fenrir-ccs-website`, connected to `Blakebannon/Fenrir_CCS_Website` on `main`.
- Use Git integration or Wrangler deployment from the repository root. Dashboard drag-and-drop of dist/ does **not** deploy Pages Functions.
- Keep private source/review material private. Never add CRM files, policy certificates, .env files, .dev.vars*, private records or signing keys.

The repaired Cloudflare GitHub integration deploys pushes to `main`. For an authorized manual deployment from the full repository, the project argument is `--project-name fenrir-ccs-website`.

## Public build variables

| Name | Local review | Pages preview/staging | Future production |
|---|---|---|---|
| PUBLIC_DEPLOYMENT_ENV | local (default) | **preview** | production (automatic for Cloudflare main if unset) |
| PUBLIC_SITE_URL | Blank | Real canonical origin once chosen, or blank | https://fenrircleaningservice.com (production default) |
| PUBLIC_BUSINESS_PHONE | 303-513-4389 (source default) | 303-513-4389 | 303-513-4389 |
| PUBLIC_BUSINESS_EMAIL | Blank | Verified public value only | Verified public email or blank |
| PUBLIC_FORM_ENABLED | false | **false** | true, or omit to use the enabled production default |
| PUBLIC_TURNSTILE_SITE_KEY | Blank | Blank | Real public site key once ready |
| PUBLIC_ALLOW_INDEXING | false | **false** | Keep false until verification and launch approval |

Preview mode hard-disables submission and indexing even if enable flags are accidentally true. QA uses a separate .qa-dist build. Production activation validates canonical origin, direct contact, and a non-test site key. Build values require a rebuild.

A real PUBLIC_SITE_URL can prepare canonical links, Open Graph URLs and the four sitemap entries while indexing stays off. Without a real domain, the local build has no invented canonical and an empty sitemap. Preview emits noindex/nofollow and Disallow: /. These are indexing controls, not authentication: use Cloudflare Access for private review. Explicitly set preview environment values rather than inheriting production flags.

## Server-side environment and secrets

| Binding | Storage | Current state |
|---|---|---|
| INQUIRIES_ENABLED | Tracked nonsecret vars in wrangler.toml, plus preview override | true in production; false in preview |
| SITE_ORIGIN | Tracked nonsecret vars in wrangler.toml | https://fenrircleaningservice.com |
| TURNSTILE_SECRET_KEY | Cloudflare Pages production secret | Existing configuration reported by owner |
| RESEND_API_KEY | Cloudflare Pages production secret | Existing configuration reported by owner |
| INQUIRY_FROM | Cloudflare Pages production secret | Existing configuration reported by owner |
| INQUIRY_TO | Cloudflare Pages production secret | Existing configuration reported by owner |

Use the secret UI or interactive secret tooling. Never put secret values in command arguments, screenshots, source files, logs, or public-prefixed variables. Do not copy runtime secrets to preview environments. The public origin/contact/site-key values are intentionally public; recipient and provider keys stay server-side.

Wrangler is the source of truth for its nonsecret vars. The top-level `INQUIRIES_ENABLED` is now true following the owner's activation request; the preview override remains false. A dashboard edit to that same nonsecret variable can be overwritten by tracked configuration. Explicit public build overrides still apply and require a rebuild after changing them.

After a reviewed Wrangler install, `npx wrangler pages dev dist` can test the actual Pages runtime locally. Local secrets belong in ignored .dev.vars; never print it. Regular `npm run preview` is static only.

Read the single **LAUNCH-CHECKLIST.md** and the real-delivery acceptance procedure in FORM-INTEGRATION.md. Resolve DEPENDENCIES.md blockers, check routing/headers in a protected deployment, then confirm a real inquiry in the intended inbox. Provider API acceptance and controlled tests alone do not establish production readiness.

Primary references: [Functions setup/deployment](https://developers.cloudflare.com/pages/functions/get-started/), [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/), [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [local Functions runtime](https://developers.cloudflare.com/pages/functions/local-development/).
