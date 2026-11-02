import { resolveLaunch, phoneUrl, type Credential } from './launch';
const launch = resolveLaunch({
  PUBLIC_DEPLOYMENT_ENV: import.meta.env.PUBLIC_DEPLOYMENT_ENV,
  PUBLIC_SITE_URL: import.meta.env.PUBLIC_SITE_URL,
  PUBLIC_ALLOW_INDEXING: import.meta.env.PUBLIC_ALLOW_INDEXING,
  PUBLIC_BUSINESS_PHONE: import.meta.env.PUBLIC_BUSINESS_PHONE,
  PUBLIC_BUSINESS_EMAIL: import.meta.env.PUBLIC_BUSINESS_EMAIL,
  PUBLIC_FORM_ENABLED: import.meta.env.PUBLIC_FORM_ENABLED,
  PUBLIC_TURNSTILE_SITE_KEY: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY,
  CF_PAGES: process.env.CF_PAGES,
  CF_PAGES_BRANCH: process.env.CF_PAGES_BRANCH,
});
const {siteUrl,phone,email} = launch;

export const business = {
  name: 'Fenrir Commercial Cleaning Service',
  owner: 'Blake Bannon',
  legalProvider: 'Red Rocks Technology Group LLC d/b/a Fenrir Commercial Cleaning Service',
  base: 'Bailey, Colorado',
  serviceAreas: ['Bailey', 'Conifer', 'Evergreen'],
  additionalServiceAreas: [] as string[], // Add only after owner approval.
  phone,
  phoneHref: phoneUrl(phone),
  email,
  socialLinks: [] as { label: string; url: string }[],
  credentials: [] as Credential[], // Public approved wording only; keep policy documents/numbers outside Git.
  reviews: [] as { quote: string; author: string; evidenceUrl: string }[],
  form: {
    enabled: launch.formEnabled,
    endpoint: '/api/walkthrough',
    turnstileSiteKey: launch.siteKey,
  },
  seo: {
    siteUrl,
    allowIndexing: launch.allowIndexing,
    description: 'Owner-operated commercial cleaning in Bailey, Conifer, and Evergreen, Colorado. A written cleaning scope and an agreed schedule for your workplace.',
  },
};
