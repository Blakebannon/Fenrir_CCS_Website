import { handleWalkthrough, type FormEnvironment } from '../../server/walkthrough.ts';

// Cloudflare Pages file routing exposes this handler at /api/walkthrough.
export const onRequest = (context: { request: Request; env: FormEnvironment }) => handleWalkthrough(context.request, context.env);
