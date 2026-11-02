import type { APIRoute } from 'astro';
import { business } from '../config/business';
import { robotsText } from '../config/launch';
export const GET: APIRoute = () => new Response(robotsText(business.seo.siteUrl,business.seo.allowIndexing), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
