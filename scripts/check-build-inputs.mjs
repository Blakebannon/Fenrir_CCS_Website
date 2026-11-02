import { readFile, readdir } from 'node:fs/promises';
// Keep image processing limited to reviewed local PNGs. No user uploads, AVIF,
// remote image sources, live Astro image endpoint, or SSR are used in this site.
const config = await readFile('astro.config.mjs','utf8');
if (!config.includes("output: 'static'")) throw new Error('This project must remain a static marketing site.');
for (const file of await readdir('src/assets')) if (!/\.png$/.test(file)) throw new Error('Review new image formats and dependency advisories before building.');
const pages = await readdir('src/pages');
if (pages.some(name => name.includes('api'))) throw new Error('Public receiving code belongs in the isolated Cloudflare Pages Function.');
