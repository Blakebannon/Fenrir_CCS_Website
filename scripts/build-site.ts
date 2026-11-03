import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { productionBuildEnvironment } from './production-build-env.ts';

const environment = productionBuildEnvironment(process.env, await readFile('wrangler.toml', 'utf8'));
const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build', ...process.argv.slice(2)], {
  env: environment, stdio: 'inherit',
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
