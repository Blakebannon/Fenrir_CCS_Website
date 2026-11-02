import { mkdir, writeFile } from 'node:fs/promises';
import { logoPaths, logoViewBox } from '../src/config/brand.ts';
const paths = logoPaths.map(d => `<path d="${d}" fill-rule="evenodd"/>`).join('');
await mkdir('public/brand', { recursive:true });
await writeFile('public/brand/mark.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${logoViewBox}" fill="#293f35"><title>Fenrir Commercial Cleaning Service — wolf and mountain mark</title>${paths}</svg>\n`);
await writeFile('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112"><rect width="112" height="112" rx="8" fill="#293f35"/><g fill="#f5f1e8" transform="translate(1 5)">${paths}</g></svg>\n`);
await writeFile('public/brand/mark-reversed.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${logoViewBox}" fill="#f5f1e8"><title>Fenrir Commercial Cleaning Service — reversed wolf and mountain mark</title>${paths}</svg>\n`);
console.log('Native wolf/ridgeline mark and matching favicon generated.');
