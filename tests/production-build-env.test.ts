import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { productionBuildEnvironment } from '../scripts/production-build-env.ts';
import { resolveLaunch } from '../src/config/launch.ts';

const source = await readFile('wrangler.toml', 'utf8');
const siteKey = '0x4AAAAAAFxSr9EAi6JGFWTA';

test('Wrangler production public settings reach the Astro build without changing other variables', () => {
  const input = { CF_PAGES: '1', CF_PAGES_BRANCH: 'main', PUBLIC_BUSINESS_PHONE: '303-513-4389', RESEND_API_KEY: 'unchanged-fixture', TURNSTILE_SECRET_KEY: 'unchanged-fixture' };
  const result = productionBuildEnvironment(input, source);
  assert.equal(result.PUBLIC_DEPLOYMENT_ENV, 'production');
  assert.equal(result.PUBLIC_FORM_ENABLED, 'true');
  assert.equal(result.PUBLIC_TURNSTILE_SITE_KEY, siteKey);
  assert.equal(result.PUBLIC_ALLOW_INDEXING, 'true');
  for (const [key, value] of Object.entries(input)) assert.equal(result[key], value);
  assert.equal('PUBLIC_TURNSTILE_SITE_KEY' in input, false);
  assert.equal(resolveLaunch(result).formEnabled, true);
  assert.equal(resolveLaunch(result).allowIndexing, true);
});

test('production indexing follows the repository release setting while preview stays noindex', () => {
  const input = { CF_PAGES: '1', CF_PAGES_BRANCH: 'main', PUBLIC_ALLOW_INDEXING: 'false', RESEND_API_KEY: 'unchanged-fixture' };
  const result = productionBuildEnvironment(input, source);
  assert.equal(result.PUBLIC_ALLOW_INDEXING, 'true');
  assert.equal(result.RESEND_API_KEY, input.RESEND_API_KEY);
  assert.equal(resolveLaunch(result).allowIndexing, true);
  const preview = productionBuildEnvironment({ ...input, CF_PAGES_BRANCH: 'feature', PUBLIC_ALLOW_INDEXING: 'true', PUBLIC_DEPLOYMENT_ENV: 'production' }, source);
  assert.equal(resolveLaunch(preview).allowIndexing, false);
});

test('preview and local builds do not receive production public defaults', () => {
  for (const input of [{}, { CF_PAGES: '1', CF_PAGES_BRANCH: 'feature' }, { PUBLIC_DEPLOYMENT_ENV: 'qa' }]) {
    assert.deepEqual(productionBuildEnvironment(input, source), input);
  }
});

test('explicit build overrides and missing-configuration safeguards remain effective', () => {
  const input = { CF_PAGES: '1', CF_PAGES_BRANCH: 'main', PUBLIC_FORM_ENABLED: 'false', PUBLIC_TURNSTILE_SITE_KEY: 'explicit-public-key' };
  const result = productionBuildEnvironment(input, source);
  assert.equal(result.PUBLIC_FORM_ENABLED, 'false');
  assert.equal(result.PUBLIC_TURNSTILE_SITE_KEY, 'explicit-public-key');
  assert.throws(() => resolveLaunch(result), /PUBLIC_FORM_ENABLED=true/);
  const blank = productionBuildEnvironment({ CF_PAGES: '1', CF_PAGES_BRANCH: 'main', PUBLIC_TURNSTILE_SITE_KEY: '' }, source);
  assert.throws(() => resolveLaunch(blank), /requires PUBLIC_TURNSTILE_SITE_KEY/);
  const missing = source.replace(/^PUBLIC_TURNSTILE_SITE_KEY\s*=.*$/m, '');
  assert.throws(() => productionBuildEnvironment({ CF_PAGES: '1', CF_PAGES_BRANCH: 'main' }, missing), /PUBLIC_TURNSTILE_SITE_KEY in wrangler.toml/);
});
