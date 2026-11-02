import { build } from 'esbuild';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
const root = process.cwd();
await mkdir('review', {recursive:true});
await build({
  entryPoints: ['functions/api/walkthrough.ts'], outfile: 'review/cloudflare-function.mjs', bundle:true, platform:'browser', format:'esm', target:'es2022',
  plugins: [{ name:'workspace-only-resolution', setup(builder) {
    builder.onResolve({filter:/.*/}, args => {
      const path = resolve(args.resolveDir || root, args.path);
      if (!path.startsWith(root + sep)) throw new Error('Receiver imports must remain in the workspace.');
      return {path,namespace:'workspace'};
    });
    builder.onLoad({filter:/.*/,namespace:'workspace'}, async args => ({contents:await readFile(args.path,'utf8'),loader:'ts',resolveDir:dirname(args.path)}));
  }}],
});
console.log('Cloudflare Function bundled using Web APIs and workspace-only imports.');
