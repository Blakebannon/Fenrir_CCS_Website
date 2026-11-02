# Cloudflare deployment preparation — not published

## Structure confirmed locally

| Location | Actual role |
|---|---|
| astro.config.mjs | Static Astro output and restricted PNG image service. No SSR adapter/server. |
| dist/ | Static pages/assets, custom 404, headers, routes, robots and sitemap. |
| functions/api/walkthrough.ts | Pages file-routing entry point at **/api/walkthrough**, exporting onRequest. |
| server/walkthrough.ts | Shared Web API receiver, Turnstile verification and Resend transport. No Astro/Sharp/esbuild/Node service or CRM runtime. |
| public/_routes.json | Function invocation limited to /api/*; marketing routes are static. |
| wrangler.toml | Pages output ./dist, compatibility date, provisional project name and disabled runtime switch. Not a Worker main configuration. |

The entry point is type-checked, invoked by tests, and bundled by `node scripts/check-function.mjs`. This confirms structure/local compilation. **Wrangler emulation and a hosted Cloudflare deployment have not been tested.** A static file upload alone cannot provide the POST endpoint.

## Required build settings

- Root directory: this repository root, including both src/ and functions/.
- Install from package-lock.json. Build: **npm run build**. Output: **dist**.
- Pages V2 build system or later. Supported runtime: Node >=22.12.0, npm >=9.6.5. Local checks use Node 25.9.0 and npm 11.12.1. Recheck requirements when migrating dependencies; no migration is installed.
- Choose the actual account, Pages project and production branch; align the provisional wrangler.toml name with that project.
- Use Git integration or Wrangler deployment from the repository root. Dashboard drag-and-drop of dist/ does **not** deploy Pages Functions.
- Keep private source/review material private. Never add CRM files, policy certificates, .env files, .dev.vars*, private records or signing keys.

Future deployment command, only after publication is authorized: `npx wrangler pages deploy dist --project-name <actual-project>`. No deployment command was run.

## Public build variables

| Name | Local review | Pages preview/staging | Future production |
|---|---|---|---|
| PUBLIC_DEPLOYMENT_ENV | local (default) | **preview** | production |
| PUBLIC_SITE_URL | Blank | Real canonical origin once chosen, or blank | Actual HTTPS origin; no path/query/credentials |
| PUBLIC_BUSINESS_PHONE | 303-513-4389 (source default) | 303-513-4389 | 303-513-4389 |
| PUBLIC_BUSINESS_EMAIL | Blank | Verified public value only | Verified public email or blank |
| PUBLIC_FORM_ENABLED | false | **false** | Keep false until configured and tested |
| PUBLIC_TURNSTILE_SITE_KEY | Blank | Blank | Real public site key once ready |
| PUBLIC_ALLOW_INDEXING | false | **false** | Keep false until verification and launch approval |

Preview mode hard-disables submission and indexing even if enable flags are accidentally true. QA uses a separate .qa-dist build. Production activation validates canonical origin, direct contact, and a non-test site key. Build values require a rebuild.

A real PUBLIC_SITE_URL can prepare canonical links, Open Graph URLs and the four sitemap entries while indexing stays off. Without a real domain, the local build has no invented canonical and an empty sitemap. Preview emits noindex/nofollow and Disallow: /. These are indexing controls, not authentication: use Cloudflare Access for private review. Explicitly set preview environment values rather than inheriting production flags.

## Server-side environment and secrets

| Binding | Storage | Current state |
|---|---|---|
| INQUIRIES_ENABLED | Tracked nonsecret vars in wrangler.toml, plus preview override | **false in both** |
| SITE_ORIGIN | Cloudflare Pages production secret | Unset |
| TURNSTILE_SECRET_KEY | Cloudflare Pages production secret | Unset |
| RESEND_API_KEY | Cloudflare Pages production secret | Unset |
| INQUIRY_FROM | Cloudflare Pages production secret | Unset |
| INQUIRY_TO | Cloudflare Pages production secret | Unset |

Use the secret UI or interactive secret tooling. Never put secret values in command arguments, screenshots, source files, logs, or public-prefixed variables. Do not copy runtime secrets to preview environments. The public origin/contact/site-key values are intentionally public; recipient and provider keys stay server-side.

Wrangler is the source of truth for its nonsecret vars. During a later authorized protected delivery test, change the top-level INQUIRIES_ENABLED to true **only after secrets are configured**, retaining the preview override as false. A dashboard edit to that same nonsecret variable can be overwritten by tracked configuration. The browser's independent PUBLIC_FORM_ENABLED switch also remains off until the workflow is ready.

After a reviewed Wrangler install, `npx wrangler pages dev dist` can test the actual Pages runtime locally. Local secrets belong in ignored .dev.vars; never print it. Regular `npm run preview` is static only.

Read the single **LAUNCH-CHECKLIST.md** and the real-delivery acceptance procedure in FORM-INTEGRATION.md. Resolve DEPENDENCIES.md blockers, check routing/headers in a protected deployment, then confirm a real inquiry in the intended inbox. Provider API acceptance and controlled tests alone do not establish production readiness.

Primary references: [Functions setup/deployment](https://developers.cloudflare.com/pages/functions/get-started/), [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/), [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [local Functions runtime](https://developers.cloudflare.com/pages/functions/local-development/).
