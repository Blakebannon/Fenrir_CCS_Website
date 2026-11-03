import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

// Exercise the actual build wrapper with the approved public key and no live providers.
const fixture = {
  ...process.env,
  CF_PAGES: '1', CF_PAGES_BRANCH: 'main', QA_BUILD: 'false',
  PUBLIC_SITE_URL: 'https://fenrircleaningservice.com',
  PUBLIC_BUSINESS_PHONE: '303-513-4389', PUBLIC_BUSINESS_EMAIL: '',
};
for (const name of ['PUBLIC_DEPLOYMENT_ENV', 'PUBLIC_FORM_ENABLED', 'PUBLIC_TURNSTILE_SITE_KEY', 'PUBLIC_ALLOW_INDEXING', 'TURNSTILE_SECRET_KEY', 'RESEND_API_KEY', 'INQUIRY_FROM', 'INQUIRY_TO']) delete fixture[name];

async function build(context, overrides = {}, expectedError) {
  const output = `.cache/form-build-${context}`;
  const result = spawnSync(process.execPath, ['--experimental-strip-types', 'scripts/build-site.ts', '--outDir', output], {
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
assert.match(production, /data-sitekey="0x4AAAAAAFxSr9EAi6JGFWTA"/);
assert.match(production, /src="https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js"/);
assert.match(production, /rel="canonical" href="https:\/\/fenrircleaningservice\.com\/request-walkthrough"/);
assert.doesNotMatch(production, /class="form-unavailable"/);

const origin = 'https://fenrircleaningservice.com';
const publicPaths = ['/', '/about', '/request-walkthrough', '/privacy'];
for (const path of publicPaths) {
  const file = path === '/' ? 'index.html' : `${path.slice(1)}/index.html`;
  const html = await readFile(`.cache/form-build-production/${file}`, 'utf8');
  assert.match(html, /<meta name="robots" content="index, follow"/);
  assert.doesNotMatch(html, /<meta\b[^>]*(?:name|http-equiv)="(?:robots|googlebot|bingbot|x-robots-tag)"[^>]*content="[^"]*(?:noindex|none)/i);
  assert.ok(html.includes(`rel="canonical" href="${origin}${path}"`), `Canonical URL for ${path}`);
}
const headers = await readFile('.cache/form-build-production/_headers', 'utf8');
assert.doesNotMatch(headers, /X-Robots-Tag\s*:[^\r\n]*(?:noindex|none)/i);
const robots = await readFile('.cache/form-build-production/robots.txt', 'utf8');
assert.match(robots, /^Allow:\s*\/\s*$/m);
assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m);
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
const sitemap = await readFile('.cache/form-build-production/sitemap.xml', 'utf8');
assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]), publicPaths.map(path => origin + path));

const preview = await build('preview', { CF_PAGES_BRANCH: 'feature', PUBLIC_DEPLOYMENT_ENV: 'production', PUBLIC_FORM_ENABLED: 'true', PUBLIC_TURNSTILE_SITE_KEY: '0x4AAAAAAFxSr9EAi6JGFWTA', PUBLIC_ALLOW_INDEXING: 'true' });
assert.match(preview, /data-enabled="false"/);
assert.match(preview, /<fieldset[^>]*disabled/);
assert.doesNotMatch(preview, /src="https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js"/);
assert.match(preview, /content="noindex, nofollow"/);
for (const path of publicPaths) {
  const file = path === '/' ? 'index.html' : `${path.slice(1)}/index.html`;
  assert.match(await readFile(`.cache/form-build-preview/${file}`, 'utf8'), /<meta name="robots" content="noindex, nofollow"/);
}
assert.match(await readFile('.cache/form-build-preview/robots.txt', 'utf8'), /^Disallow:\s*\/\s*$/m);

await build('missing-key', { PUBLIC_TURNSTILE_SITE_KEY: '' }, /requires PUBLIC_TURNSTILE_SITE_KEY/);
console.log('Production public pages are indexable with canonical production URLs, crawlable robots.txt and the exact sitemap; form and key remain enabled. Preview pages remain noindex and disallowed. Missing-key checks remain enforced.');
