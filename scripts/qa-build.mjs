import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { stdio: 'inherit', env: { ...process.env, CF_PAGES: '0', CF_PAGES_BRANCH: '', QA_BUILD: 'true', PUBLIC_DEPLOYMENT_ENV:'qa', PUBLIC_SITE_URL: '', PUBLIC_ALLOW_INDEXING: 'false', PUBLIC_FORM_ENABLED: 'true', PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA', PUBLIC_BUSINESS_PHONE: '+1 303 555 0142', PUBLIC_BUSINESS_EMAIL: 'review@example.test' } });
// These deliberately reserved contacts exist only in .qa-dist, never in dist.
process.exit(result.status ?? 1);
