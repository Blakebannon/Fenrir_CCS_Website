import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleWalkthrough, type FormEnvironment } from '../server/walkthrough.ts';
import { validateInquiry } from '../src/lib/inquiry.ts';
const env: FormEnvironment = { INQUIRIES_ENABLED: 'true', SITE_ORIGIN: 'https://fenrir.example.test', TURNSTILE_SECRET_KEY: 'server-secret', RESEND_API_KEY: 'email-secret', INQUIRY_FROM: 'Fenrir <inquiry@example.test>', INQUIRY_TO: 'owner@example.test' };
const valid = { contactName: 'Test Contact', businessName: 'Test Office', town: 'Bailey', email: 'contact@example.test', phone: '', startedAt: Date.now() - 5000, requestId: 'aa328891-d61c-4ac8-b7f1-a132c09db9e4', turnstileToken: 'test-token', website: '' };
const request = (changes = {}, headers = {}) => new Request(`${env.SITE_ORIGIN}/api/walkthrough`, { method: 'POST', headers: { origin: env.SITE_ORIGIN!, 'content-type': 'application/json', ...headers }, body: JSON.stringify({ ...valid, ...changes }) });
function controlledFetch(options: { verify?: Record<string, unknown>; status?: number; delivery?: object; throws?: boolean } = {}) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    if (options.throws) throw new Error('receiver unavailable');
    if (String(input).includes('siteverify')) return Response.json(options.verify ?? { success: true, hostname: 'fenrir.example.test', action: 'request_walkthrough' });
    return Response.json(options.delivery ?? { id: 'controlled-receipt' }, { status: options.status ?? 200 });
  };
  return { fetcher, calls };
}
test('accepts email-only inquiry only after verified delivery, sends plain text and server credentials', async () => {
  const { fetcher, calls } = controlledFetch(); const response = await handleWalkthrough(request(), env, { fetch: fetcher });
  assert.equal(response.status, 200); assert.equal((await response.json()).accepted, true); assert.equal(calls.length, 2);
  const payload = JSON.parse(calls[1].init!.body as string); assert.equal(payload.reply_to, valid.email); assert.match(payload.text, /Test Office/); assert.equal(payload.html, undefined);
  assert.equal((calls[1].init!.headers as Record<string,string>).Authorization, 'Bearer email-secret');
});
test('phone only is sufficient; preferred method must have corresponding details', () => {
  assert.deepEqual(validateInquiry({ ...valid, email: '', phone: '(303) 555-0123' }).errors, {});
  assert.ok(validateInquiry({ ...valid, preferredContact: 'Phone' }).errors.phone);
  assert.ok(validateInquiry({ ...valid, email: '', phone: '3035550123', preferredContact: 'Email' }).errors.email);
});
test('missing both contact methods is rejected server-side before external calls', async () => {
  const { fetcher, calls } = controlledFetch(); const response = await handleWalkthrough(request({ email: '' }), env, { fetch: fetcher });
  assert.equal(response.status, 422); assert.ok((await response.json()).errors.phone); assert.equal(calls.length, 0);
});
test('invalid fields and enumeration tampering are rejected', () => {
  const result = validateInquiry({ ...valid, email: 'invalid', town: 'Denver', contactName: '', frequency: 'unlimited', message: 'x'.repeat(2001) });
  for (const field of ['email','town','contactName','frequency','message'] as const) assert.ok(result.errors[field]);
});
test('cross-origin and missing origin rejected', async () => {
  for (const origin of ['https://elsewhere.example.test', '']) assert.equal((await handleWalkthrough(request({}, { origin }), env)).status, 403);
});
test('missing configuration fails closed', async () => { assert.equal((await handleWalkthrough(request(), {})).status, 503); });
test('runtime switch disables delivery even when all credentials are configured', async () => {
  const {fetcher,calls} = controlledFetch();
  assert.equal((await handleWalkthrough(request(), {...env,INQUIRIES_ENABLED:'false'}, {fetch:fetcher})).status,503);
  assert.equal(calls.length,0);
});
test('honeypot and implausible timing never deliver', async () => {
  for (const changes of [{ website: 'spam' }, { startedAt: Date.now() }, { startedAt: 0 }]) {
    const { fetcher, calls } = controlledFetch(); assert.equal((await handleWalkthrough(request(changes), env, { fetch: fetcher })).status, 422); assert.equal(calls.length, 0);
  }
});
test('invalid, wrong-host, and wrong-action Turnstile tokens never deliver', async () => {
  for (const verify of [{ success: false }, { success: true, hostname: 'elsewhere', action: 'request_walkthrough' }, { success: true, hostname: 'fenrir.example.test', action: 'other' }]) {
    const { fetcher, calls } = controlledFetch({ verify }); assert.equal((await handleWalkthrough(request(), env, { fetch: fetcher })).status, 422); assert.equal(calls.length, 1);
  }
});
test('receiver rejection, missing receipt, and network failure never report success', async () => {
  for (const options of [{ status: 500 }, { delivery: {} }, { throws: true }]) {
    const { fetcher } = controlledFetch(options); const response = await handleWalkthrough(request(), env, { fetch: fetcher }); assert.equal(response.status, 502); assert.notEqual((await response.json()).accepted, true);
  }
});
test('retries use stable content-bound idempotency; edited inquiries get a new key', async () => {
  const keys: string[] = [];
  for (const changes of [{}, {}, { message: 'New details' }]) { const { fetcher, calls } = controlledFetch(); await handleWalkthrough(request(changes), env, { fetch: fetcher }); keys.push((calls[1].init!.headers as Record<string,string>)['Idempotency-Key']); }
  assert.equal(keys[0], keys[1]); assert.notEqual(keys[0], keys[2]);
});
test('malformed, oversized, non-JSON, and unsupported method requests are rejected', async () => {
  assert.equal((await handleWalkthrough(new Request(env.SITE_ORIGIN!), env)).status, 405);
  assert.equal((await handleWalkthrough(request({}, { 'content-type': 'text/plain' }), env)).status, 415);
  const malformed = new Request(env.SITE_ORIGIN!, { method: 'POST', headers: { origin: env.SITE_ORIGIN!, 'content-type': 'application/json' }, body: '{' });
  assert.equal((await handleWalkthrough(malformed, env)).status, 400);
  assert.equal((await handleWalkthrough(request({ message: 'x'.repeat(15000) }), env)).status, 413);
});
test('production rejects known Turnstile test secrets', async () => { assert.equal((await handleWalkthrough(request(), { ...env, TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA' })).status, 503); });
