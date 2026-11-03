import { fieldNames, labels, validateInquiry } from '../src/lib/inquiry.ts';

export interface FormEnvironment {
  INQUIRIES_ENABLED?: string;
  SITE_ORIGIN?: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  INQUIRY_FROM?: string;
  INQUIRY_TO?: string;
  PUBLIC_TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
}
interface Dependencies { fetch?: typeof fetch; now?: () => number }
const reply = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });

function configuredOrigin(env: FormEnvironment): URL | undefined {
  if (env.INQUIRIES_ENABLED !== 'true') return;
  let origin: URL;
  try { origin = new URL(env.SITE_ORIGIN || ''); } catch { return; }
  const local = ['127.0.0.1', 'localhost'].includes(origin.hostname);
  if ((!local && origin.protocol !== 'https:') || !env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY || !env.INQUIRY_FROM || !env.INQUIRY_TO || (!local && /^[123]x000000/.test(env.TURNSTILE_SECRET_KEY))) return;
  return origin;
}

/** Only the public widget key is returned; delivery credentials stay server-side. */
export function walkthroughConfiguration(request: Request, env: FormEnvironment): Response {
  if (request.method !== 'GET') return reply(405, { enabled: false });
  const origin = configuredOrigin(env);
  const siteKey = (env.PUBLIC_TURNSTILE_SITE_KEY || env.TURNSTILE_SITE_KEY || '').trim();
  if (!origin) {
    const missingSettings = ['SITE_ORIGIN', 'TURNSTILE_SECRET_KEY', 'RESEND_API_KEY', 'INQUIRY_FROM', 'INQUIRY_TO'].filter(name => !env[name as keyof FormEnvironment]);
    if (env.INQUIRIES_ENABLED !== 'true') missingSettings.unshift('INQUIRIES_ENABLED');
    // Names only: never return private values, sender addresses, or recipient addresses.
    return reply(200, { enabled: false, missingSettings });
  }
  if (new URL(request.url).origin !== origin.origin) return reply(200, { enabled: false });
  if (!siteKey) return reply(200, { enabled: false, missingSettings: ['PUBLIC_TURNSTILE_SITE_KEY'] });
  if (!['127.0.0.1', 'localhost'].includes(origin.hostname) && /^[123]x000000/.test(siteKey)) return reply(200, { enabled: false });
  return reply(200, { enabled: true, siteKey });
}

async function readBody(request: Request): Promise<string> {
  if (Number(request.headers.get('content-length')) > 14000) throw new Error('too-large');
  const reader = request.body?.getReader();
  if (!reader) return '';
  let size = 0; const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 14000) { await reader.cancel(); throw new Error('too-large'); }
    chunks.push(value);
  }
  const combined = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(combined);
}

/** Shared production receiver. Dependencies are injected only by controlled tests. */
export async function handleWalkthrough(request: Request, env: FormEnvironment, dependencies: Dependencies = {}): Promise<Response> {
  const send = dependencies.fetch || fetch;
  const now = dependencies.now || Date.now;
  if (request.method !== 'POST') return reply(405, { message: 'Please submit a walkthrough request using the form.' });
  const origin = configuredOrigin(env);
  if (!origin) return reply(503, { message: 'Online inquiries are currently unavailable. Please use the direct contact details if shown.' });
  if (request.headers.get('origin') !== origin.origin) return reply(403, { message: 'Please reload the website and try again.' });
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply(415, { message: 'Please submit using the website form.' });
  let raw: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(await readBody(request));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return reply(400, { message: 'Please check your request and try again.' });
    raw = parsed as Record<string, unknown>;
  } catch (error) { return reply(error instanceof Error && error.message === 'too-large' ? 413 : 400, { message: 'Please check your request and keep your description brief.' }); }
  if (raw.website !== '' && raw.website !== undefined) return reply(422, { message: 'We couldn’t accept this request. Please reload and try again.' });
  const { data, errors } = validateInquiry(raw);
  if (Object.keys(errors).length) return reply(422, { errors, message: 'Please check the highlighted fields.' });
  if (typeof raw.startedAt !== 'number' || now() - raw.startedAt < 2000 || now() - raw.startedAt > 86400000) return reply(422, { message: 'Please take a moment to review your details, then try again. Reload the page if it has been open since yesterday.' });
  if (typeof raw.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw.requestId)) return reply(400, { message: 'Please reload the page and try again.' });
  if (typeof raw.turnstileToken !== 'string' || !raw.turnstileToken || raw.turnstileToken.length > 2048) return reply(422, { message: 'Please complete the security check and try again.' });
  try {
    const verification = await send('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(7000),
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: raw.turnstileToken, ...(request.headers.get('cf-connecting-ip') ? { remoteip: request.headers.get('cf-connecting-ip') } : {}) }),
    });
    const verified = await verification.json() as { success?: boolean; hostname?: string; action?: string };
    if (!verification.ok || !verified.success || verified.hostname !== origin.hostname || verified.action !== 'request_walkthrough') return reply(422, { message: 'The security check could not be verified. Please try it again.' });
    const text = `Walkthrough inquiry — Fenrir Commercial Cleaning Service\n\n${fieldNames.map(name => `${labels[name]}: ${data[name] || '(not provided)'}`).join('\n\n')}\n\nInquiry only. No appointment has been booked.\nReference: ${raw.requestId}`;
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    const contentHash = Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
    const delivery = await send('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `walkthrough-${raw.requestId}-${contentHash}` }, signal: AbortSignal.timeout(7000),
      body: JSON.stringify({ from: env.INQUIRY_FROM, to: [env.INQUIRY_TO], subject: `Walkthrough inquiry: ${data.businessName.replace(/[\r\n]/g, ' ').slice(0, 100)}`, text, ...(data.email ? { reply_to: data.email } : {}) }),
    });
    const result = await delivery.json() as { id?: string };
    if (!delivery.ok || typeof result.id !== 'string' || !result.id) return reply(502, { message: 'We couldn’t confirm delivery. Your details are still here. Please try again or use the direct contact details if shown.' });
    return reply(200, { accepted: true, id: result.id });
  } catch { return reply(502, { message: 'We couldn’t confirm delivery. Your details are still here. Please try again or use the direct contact details if shown.' }); }
}
