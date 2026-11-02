import { resolveLaunch, phoneUrl, type Credential } from './launch';
const launch = resolveLaunch(import.meta.env);
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
