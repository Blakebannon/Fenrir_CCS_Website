import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  outDir: process.env.QA_BUILD === 'true' ? './.qa-dist' : './dist',
  build: { format: 'directory' },
  image: { service: { entrypoint: './src/lib/safe-image-service.ts' } },
  vite: { server: { host: '127.0.0.1' } },
});
