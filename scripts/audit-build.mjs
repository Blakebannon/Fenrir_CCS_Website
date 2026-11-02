import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
const files = [];
const configuredSecrets = ['RESEND_API_KEY','TURNSTILE_SECRET_KEY'].map(name => process.env[name]).filter(value => value && value.length >= 8);
async function walk(dir) { for (const entry of await readdir(dir, { withFileTypes: true })) { const path = join(dir, entry.name); if (entry.isDirectory()) await walk(path); else files.push(path); } }
await walk('dist');
const allowed = new Set(['.html','.css','.js','.svg','.webp','.jpg','.png','.woff2','.txt','.xml','.json']);
for (const file of files) {
  if (!allowed.has(extname(file)) && !file.endsWith('_headers')) throw new Error(`Unexpected public file: ${file}`);
  if (/\.(html|js|json|css|svg|xml|txt)$/.test(file)) {
    const body = await readFile(file, 'utf8');
    if (configuredSecrets.some(secret => body.includes(secret))) throw new Error(`Server-only secret value found in public output: ${file}`);
    if (/RESEND_API_KEY|TURNSTILE_SECRET_KEY|INQUIRY_TO|INQUIRY_FROM|business.plan|prospects?\.csv|crm.login|sample.testimonial|trusted by hundreds/i.test(body)) throw new Error(`Private or placeholder content in ${file}`);
  }
}
console.log(`Public build audited: ${files.length} permitted files. No server secrets, source documents, or private project data included.`);
