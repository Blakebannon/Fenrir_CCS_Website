import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Inspect the Git index, so checks cover exactly the bytes being committed.
// Findings identify only the filename and category/variable, never a value.
const git = args => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const worktree = process.argv.includes('--worktree');
const files = [...new Set(git(worktree ? ['ls-files', '--cached', '--others', '--exclude-standard', '-z'] : ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']).split('\0').filter(Boolean))];
if (!files.length) throw new Error('Stage the intended files before running the secret check.');
const findings = [];
const patterns = [
  ['private signing material', /-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/],
  ['GitHub credential', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['RESEND_API_KEY', /\bre_[A-Za-z0-9_]{20,}\b/],
  ['embedded URL credential', /https?:\/\/[^\s/@:]+:[^\s/@]+@/],
  ['literal server credential', /(?:RESEND_API_KEY|TURNSTILE_SECRET_KEY)\s*[:=]\s*["'](?![123]x0{6})[A-Za-z0-9_-]{24,}["']/],
];
const secretNames = ['RESEND_API_KEY', 'TURNSTILE_SECRET_KEY', 'CLOUDFLARE_API_TOKEN', 'GITHUB_TOKEN', 'GH_TOKEN'];
for (const file of files) {
  if (/(?:^|\/)(?:node_modules|dist|\.qa-dist|\.astro|\.cache|\.aws|\.ssh|private|crm|customers|prospects|business-plans)(?:\/|$)/i.test(file) || /(?:^|\/)\.env(?:\..*)?$/.test(file) && file !== '.env.example' || /\.(?:pem|key|p12|pfx|keystore|sqlite\d*|db|csv|xlsx|docx)$/i.test(file)) {
    findings.push([file, 'excluded private/generated file']);
    continue;
  }
  if (!/\.(?:[cm]?[jt]s|tsx|astro|css|md|json|toml|txt|xml|svg|example)$/.test(file) && !/(?:README|gitignore|_headers|_routes)$/.test(file)) continue;
  const content = worktree ? readFileSync(file, 'utf8') : git(['show', `:${file}`]);
  for (const [label, pattern] of patterns) {
    // Reserved example.test origins are intentional URL-validation fixtures.
    if (label === 'embedded URL credential' && file.startsWith('tests/')) continue;
    if (pattern.test(content)) findings.push([file, label]);
  }
  for (const name of secretNames) {
    const value = process.env[name];
    if (value && value.length >= 8 && content.includes(value)) findings.push([file, name]);
  }
}
for (const [file, label] of findings) console.error(`${file}: ${label}`);
if (findings.length) process.exitCode = 1;
else console.log(`Secret/exclusion scan passed for ${files.length} ${worktree ? 'nonignored candidate' : 'staged'} files. This is a focused repository check, not a provider-wide credential audit.`);
