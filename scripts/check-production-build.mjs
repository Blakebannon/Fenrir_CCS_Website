import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

// Exercise Astro's actual build-time environment and generated HTML, with no live providers.
const fixture = {
  ...process.env,
  CF_PAGES: '1', CF_PAGES_BRANCH: 'main', QA_BUILD: 'false',
  PUBLIC_DEPLOYMENT_ENV: 'production', PUBLIC_FORM_ENABLED: 'true',
  PUBLIC_SITE_URL: 'https://fenrircleaningservice.com', PUBLIC_ALLOW_INDEXING: 'false',
  PUBLIC_BUSINESS_PHONE: '303-513-4389', PUBLIC_BUSINESS_EMAIL: '',
  PUBLIC_TURNSTILE_SITE_KEY: 'production-public-key-fixture',
};
for (const name of ['TURNSTILE_SECRET_KEY', 'RESEND_API_KEY', 'INQUIRY_FROM', 'INQUIRY_TO']) delete fixture[name];

async function build(context, overrides = {}, expectedError) {
  const output = `.cache/form-build-${context}`;
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', '--outDir', output], {
    env: { ...fixture, ...overrides }, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (expectedError) {
    assert.notEqual(result.status, 0, `${context} must fail instead of publishing disabled fields`);
    assert.match(result.stdout + result.stderr, expectedError);
    return;
  }
  assert.equal(result.status, 0, result.stdout + result.stderr);
  return readFile(`${output}/request-walkthrough/index.html`, 'utf8');
}

const production = await build('production');
assert.match(production, /data-enabled="true"/);
assert.match(production, /action="\/api\/walkthrough"/);
assert.doesNotMatch(production, /<fieldset[^>]*disabled/);
assert.match(production, /data-sitekey="production-public-key-fixture"/);
assert.match(production, /src="https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js"/);
assert.match(production, /rel="canonical" href="https:\/\/fenrircleaningservice\.com\/request-walkthrough"/);
assert.doesNotMatch(production, /class="form-unavailable"/);

const preview = await build('preview', { CF_PAGES_BRANCH: 'feature', PUBLIC_ALLOW_INDEXING: 'true' });
assert.match(preview, /data-enabled="false"/);
assert.match(preview, /<fieldset[^>]*disabled/);
assert.doesNotMatch(preview, /src="https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js"/);
assert.match(preview, /content="noindex, nofollow"/);

await build('missing-key', { PUBLIC_TURNSTILE_SITE_KEY: '' }, /requires PUBLIC_TURNSTILE_SITE_KEY/);
console.log('Production HTML enables the configured form; preview stays disabled; a missing production public key fails the build. Synthetic public key and output remain in .cache only.');
