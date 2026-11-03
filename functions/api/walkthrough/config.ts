import { walkthroughConfiguration, type FormEnvironment } from '../../../server/walkthrough.ts';

export const onRequest = (context: { request: Request; env: FormEnvironment }) => walkthroughConfiguration(context.request, context.env);
