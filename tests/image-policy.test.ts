import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {assertApprovedImage,restrictImageDecoders} from '../src/lib/image-policy.ts';

test('reviewed PNG images still resize into WebP with restricted decoders', async () => {
  restrictImageDecoders();
  const input = await readFile('src/assets/workplace.png');
  assert.doesNotThrow(() => assertApprovedImage(input));
  const {data,info} = await sharp(input).resize(48).webp().toBuffer({resolveWithObject:true});
  assert.equal(info.format,'webp'); assert.equal(info.width,48); assert.ok(data.length > 0);
});
test('non-PNG content is rejected before image processing even if renamed', () => {
  for (const data of ['<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>','GIF89a','not an image']) assert.throws(() => assertApprovedImage(Buffer.from(data)),/Only reviewed local PNG/);
});
test('native decoder allowlist rejects SVG independently of extension checks', async () => {
  restrictImageDecoders();
  await assert.rejects(sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>')).metadata(),/blocked|unsupported/i);
});
