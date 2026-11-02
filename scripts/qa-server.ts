/** Loopback-only QA adapter and controlled HTTP receiver. Never included in the public build. */
import { createServer, type IncomingMessage } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { handleWalkthrough } from '../server/walkthrough.ts';
const root = resolve('.qa-dist');
const receipts: unknown[] = [];
async function body(req: IncomingMessage) { const chunks = []; for await (const chunk of req) chunks.push(chunk); return Buffer.concat(chunks).toString(); }
const receiver = createServer(async (req, res) => {
  const raw = await body(req); const data = JSON.parse(raw || '{}');
  res.setHeader('Content-Type','application/json');
  if (req.url === '/verify') { res.end(JSON.stringify({ success: data.response === 'controlled-token', hostname: '127.0.0.1', action: 'request_walkthrough' })); return; }
  if (req.url !== '/emails' || req.headers.authorization !== 'Bearer controlled-secret') { res.writeHead(403); res.end('{}'); return; }
  if (data.subject?.includes('Reject Test')) { res.writeHead(503); res.end(JSON.stringify({ message: 'Controlled receiver failure' })); return; }
  const id = `controlled-${receipts.length + 1}`;
  receipts.push({ id, payload: data, idempotencyKey: req.headers['idempotency-key'] });
  await mkdir('test-results', { recursive: true }); await writeFile('test-results/controlled-receipts.json', JSON.stringify(receipts, null, 2));
  res.end(JSON.stringify({ id }));
}).listen(4181, '127.0.0.1');
const types: Record<string,string> = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.webp':'image/webp', '.woff2':'font/woff2', '.jpg':'image/jpeg', '.xml':'application/xml', '.txt':'text/plain' };
const site = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://127.0.0.1:4180');
    if (url.pathname === '/__receipts') { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(receipts)); return; }
    if (url.pathname === '/api/walkthrough') {
      const request = new Request(url, { method: req.method, headers: req.headers as Record<string,string>, ...(req.method !== 'GET' ? { body: await body(req) } : {}) });
      const response = await handleWalkthrough(request, { INQUIRIES_ENABLED:'true', SITE_ORIGIN: url.origin, TURNSTILE_SECRET_KEY: 'controlled-secret', RESEND_API_KEY: 'controlled-secret', INQUIRY_FROM: 'test@example.test', INQUIRY_TO: 'owner@example.test' }, {
        fetch: (input, init) => fetch(String(input).includes('siteverify') ? 'http://127.0.0.1:4181/verify' : 'http://127.0.0.1:4181/emails', init),
      });
      res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text()); return;
    }
    let file = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    if (!extname(file)) file = resolve(file, 'index.html');
    const content = await readFile(file); res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream'); res.end(content);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4180, '127.0.0.1', () => console.log('Controlled QA site: http://127.0.0.1:4180; receiver: http://127.0.0.1:4181'));
process.on('SIGTERM', () => { site.close(); receiver.close(); });
