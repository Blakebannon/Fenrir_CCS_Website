import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolveLaunch,phoneUrl,canonicalUrl,sitemapXml,robotsText,publishableCredentials} from '../src/config/launch.ts';

test('local defaults and preview markers never enable submission or indexing', () => {
  assert.equal(resolveLaunch({}).formEnabled,false);
  const preview = resolveLaunch({PUBLIC_DEPLOYMENT_ENV:'preview',PUBLIC_FORM_ENABLED:'true',PUBLIC_TURNSTILE_SITE_KEY:'key',PUBLIC_ALLOW_INDEXING:'true',PUBLIC_SITE_URL:'https://fenrir.example.test'});
  assert.equal(preview.formEnabled,false); assert.equal(preview.allowIndexing,false);
  assert.equal(robotsText(preview.siteUrl,preview.allowIndexing),'User-agent: *\nDisallow: /\n');
});
test('production gates fail closed without canonical origin, direct contact and a real site key', () => {
  const base = {PUBLIC_DEPLOYMENT_ENV:'production',PUBLIC_ALLOW_INDEXING:'true',PUBLIC_FORM_ENABLED:'true',PUBLIC_TURNSTILE_SITE_KEY:'production-key'};
  assert.throws(() => resolveLaunch(base),/canonical/);
  assert.throws(() => resolveLaunch({...base,PUBLIC_SITE_URL:'https://fenrir.example.test',PUBLIC_BUSINESS_PHONE:''}),/direct contact/);
  assert.throws(() => resolveLaunch({...base,PUBLIC_SITE_URL:'https://fenrir.example.test',PUBLIC_BUSINESS_EMAIL:'test@example.test',PUBLIC_TURNSTILE_SITE_KEY:'1x00000000000000000000AA'}),/production Turnstile/);
  assert.throws(() => resolveLaunch({...base,PUBLIC_SITE_URL:'https://fenrir.example.test',PUBLIC_BUSINESS_EMAIL:'test@example.test',PUBLIC_FORM_ENABLED:'false'}),/receiver/);
});

test('confirmed public phone is available without environment setup and uses international call URLs', () => {
  assert.equal(resolveLaunch({}).phone,'303-513-4389');
  assert.equal(phoneUrl(resolveLaunch({}).phone),'tel:+13035134389');
  assert.equal(phoneUrl('+1 303 513 4389'),'tel:+13035134389');
  assert.equal(phoneUrl(''),'');
});
test('canonical and sitemap paths are prepared without enabling indexing', () => {
  const settings = resolveLaunch({PUBLIC_DEPLOYMENT_ENV:'preview',PUBLIC_SITE_URL:'https://fenrir.example.test/'});
  assert.equal(settings.siteUrl,'https://fenrir.example.test'); assert.equal(settings.allowIndexing,false);
  assert.equal(canonicalUrl(settings.siteUrl,'/about'),'https://fenrir.example.test/about');
  const xml = sitemapXml(settings.siteUrl); assert.equal((xml.match(/<loc>/g)||[]).length,4); assert.match(xml,/<loc>https:\/\/fenrir.example.test\/request-walkthrough<\/loc>/);
  assert.equal(canonicalUrl('','/about'),undefined); assert.doesNotMatch(sitemapXml(''),/<loc>/);
  for (const url of ['http://fenrir.example.test','https://user:password@fenrir.example.test','https://fenrir.example.test/path','https://fenrir.example.test/?key=value']) assert.throws(() => resolveLaunch({PUBLIC_SITE_URL:url}),/canonical/);
});
test('unapproved, unverified and expired insurance/bonding claims remain unpublished', () => {
  const now = new Date('2026-11-01T12:00:00Z');
  const credential = {label:'Synthetic coverage claim',verifiedAt:'2026-10-01',approvedForPublication:true};
  assert.equal(publishableCredentials([{...credential,approvedForPublication:false},{...credential,verifiedAt:''},{...credential,validThrough:'2026-10-31'}],now).length,0);
  assert.equal(publishableCredentials([{...credential,validThrough:'2026-12-31'}],now).length,1);
});
test('Cloudflare route and static build declarations match the real handler', async () => {
  const config = await readFile('wrangler.toml','utf8'); const routes = JSON.parse(await readFile('public/_routes.json','utf8'));
  assert.match(config,/pages_build_output_dir\s*=\s*"\.\/dist"/); assert.match(config,/INQUIRIES_ENABLED\s*=\s*"false"/);
  assert.deepEqual(routes.include,['/api/*']);
  const {onRequest} = await import('../functions/api/walkthrough.ts');
  const response = await onRequest({request:new Request('https://fenrir.example.test/api/walkthrough',{method:'POST'}),env:{}});
  assert.equal(response.status,503);
});
