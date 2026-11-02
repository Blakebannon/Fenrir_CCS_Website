import sharp from 'sharp';
const pngSignature = [137,80,78,71,13,10,26,10];

/** Upstream-supported decoder allowlist; applies inside every image worker. */
export function restrictImageDecoders(): void {
  sharp.block({operation:['VipsForeignLoad']});
  sharp.unblock({operation:['VipsForeignLoadPngBuffer','VipsForeignLoadPngFile']});
}

export function assertApprovedImage(input: Uint8Array): void {
  if (!pngSignature.every((byte,index) => input[index] === byte)) throw new Error('Only reviewed local PNG inputs may be optimized.');
}
