import { parse } from 'smol-toml';

const publicBuildKeys = ['PUBLIC_DEPLOYMENT_ENV', 'PUBLIC_FORM_ENABLED', 'PUBLIC_TURNSTILE_SITE_KEY'] as const;
type BuildEnvironment = Record<string, string | undefined>;

/** Wrangler vars are runtime bindings; copy only approved public defaults into Astro's process. */
export function productionBuildEnvironment(environment: BuildEnvironment, wranglerSource: string): BuildEnvironment {
  const result = { ...environment };
  const production = environment.CF_PAGES === '1'
    ? environment.CF_PAGES_BRANCH === 'main'
    : environment.PUBLIC_DEPLOYMENT_ENV?.trim() === 'production';
  if (!production) return result;

  const vars = parse(wranglerSource).vars as Record<string, unknown> | undefined;
  for (const key of publicBuildKeys) {
    const configured = vars?.[key];
    if (typeof configured !== 'string' || !configured.trim()) throw new Error(`Production build requires ${key} in wrangler.toml [vars].`);
    // Preserve explicit Cloudflare build settings; existing launch checks validate bad overrides.
    if (result[key] === undefined) result[key] = configured.trim();
  }
  return result;
}
