import sharpService from 'astro/assets/services/sharp';
import type { LocalImageService } from 'astro';
import { assertApprovedImage, restrictImageDecoders } from './image-policy';

const service: LocalImageService = {
  ...sharpService,
  async transform(input, transform, config) {
    assertApprovedImage(input);
    restrictImageDecoders();
    return sharpService.transform(input, transform, config);
  },
};
export default service;
