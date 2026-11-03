export type BuildValues = Record<string,string | undefined>;
export const publicPagePaths = ['/', '/about', '/request-walkthrough', '/privacy'] as const;

/** Pure build-time policy, also exercised without embedding any credentials. */
export function resolveLaunch(values: BuildValues) {
  const cloudflareEnvironment = values.CF_PAGES === '1' ? (values.CF_PAGES_BRANCH === 'main' ? 'production' : 'preview') : 'local';
  const requestedEnvironment = values.PUBLIC_DEPLOYMENT_ENV?.trim();
  if (cloudflareEnvironment === 'production' && requestedEnvironment && requestedEnvironment !== 'production') throw new Error('Cloudflare main requires PUBLIC_DEPLOYMENT_ENV=production. Local, preview, and QA overrides must not disable the production form.');
  const environment = cloudflareEnvironment === 'preview' ? 'preview' : requestedEnvironment || cloudflareEnvironment;
  if (!['local','preview','production','qa'].includes(environment)) throw new Error('PUBLIC_DEPLOYMENT_ENV must be local, preview, production, or qa.');
  const rawUrl = (values.PUBLIC_SITE_URL || (environment === 'production' ? 'https://fenrircleaningservice.com' : '')).trim();
  let siteUrl = '';
  if (rawUrl) {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error('PUBLIC_SITE_URL must be a canonical HTTPS origin without a path, query, or credentials.');
    siteUrl = parsed.origin;
  }
  const phone = (values.PUBLIC_BUSINESS_PHONE ?? '303-513-4389').trim();
  const email = (values.PUBLIC_BUSINESS_EMAIL || '').trim();
  const siteKey = (values.PUBLIC_TURNSTILE_SITE_KEY || '').trim();
  const formRequested = values.PUBLIC_FORM_ENABLED?.trim() ?? (environment === 'production' ? 'true' : 'false');
  if (environment === 'production' && !['true','false'].includes(formRequested)) throw new Error('PUBLIC_FORM_ENABLED must be true or false.');
  if (cloudflareEnvironment === 'production' && formRequested !== 'true') throw new Error('Cloudflare main requires PUBLIC_FORM_ENABLED=true. Production activation must not publish a disabled contact form.');
  if (environment === 'production' && formRequested === 'true' && !siteKey) throw new Error('Production contact form requires PUBLIC_TURNSTILE_SITE_KEY in Cloudflare Pages production build variables. Use the public widget site key, not TURNSTILE_SECRET_KEY.');
  const formEnabled = ['production','qa'].includes(environment) && formRequested === 'true' && Boolean(siteKey);
  const allowIndexing = environment === 'production' && values.PUBLIC_ALLOW_INDEXING === 'true';
  if (environment === 'production' && (formEnabled || allowIndexing)) {
    if (!siteUrl) throw new Error('Production contact and indexing require a canonical HTTPS PUBLIC_SITE_URL.');
    if (!phone && !email) throw new Error('Configure verified direct contact before enabling production inquiries or indexing.');
    if (phone && (phone.replace(/\D/g,'').length < 10 || phone.replace(/\D/g,'').length > 15)) throw new Error('Configure a valid verified public phone.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Configure a valid verified public email.');
    if (/^[123]x000000/.test(siteKey)) throw new Error('Use a production Turnstile site key.');
  }
  if (allowIndexing && !formEnabled) throw new Error('Verify the inquiry receiver before enabling production indexing.');
  return {environment,siteUrl,phone,email,siteKey,formEnabled,allowIndexing};
}

export const canonicalUrl = (siteUrl: string, path: string) => siteUrl ? new URL(path, `${siteUrl}/`).href : undefined;
/** Default US numbers to +1 so phone actions also work on mobile devices. */
export function phoneUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits ? `tel:+${digits.length === 10 ? `1${digits}` : digits}` : '';
}
export function sitemapXml(siteUrl: string): string {
  const escape = (value: string) => value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${siteUrl ? publicPagePaths.map(path => `<url><loc>${escape(canonicalUrl(siteUrl,path)!)}</loc></url>`).join('') : ''}</urlset>`;
}
export const robotsText = (siteUrl: string, allowIndexing: boolean) => allowIndexing ? `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n';

export interface Credential { label: string; verifiedAt: string; approvedForPublication: boolean; validThrough?: string; publicEvidenceUrl?: string }
export function publishableCredentials(credentials: Credential[], now = new Date()) {
  const today = now.toISOString().slice(0,10);
  return credentials.filter(item => item.approvedForPublication && /^\d{4}-\d{2}-\d{2}$/.test(item.verifiedAt) && item.verifiedAt <= today && (!item.validThrough || item.validThrough >= today));
}
