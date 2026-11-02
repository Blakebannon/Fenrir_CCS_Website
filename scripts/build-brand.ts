import { mkdir, readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { brandArtwork } from '../src/config/brand.ts';
import { assertApprovedImage, restrictImageDecoders } from '../src/lib/image-policy.ts';

const source = await readFile(brandArtwork.source);
assertApprovedImage(source);
restrictImageDecoders();
await mkdir('public/brand', { recursive:true });
await sharp(source).extract(brandArtwork.markCrop).resize({ width: 304 }).png().toFile('public/brand/mark.png');
await sharp(source).extract(brandArtwork.faviconCrop)
  .resize(64, 64, { fit: 'contain', background: '#f5f1e8' })
  .flatten({ background: '#f5f1e8' }).png().toFile('public/favicon.png');
console.log('Owner-supplied wolf/mountain artwork optimized for the decorative mark and favicon.');
