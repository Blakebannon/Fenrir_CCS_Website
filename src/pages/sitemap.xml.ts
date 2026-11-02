import type { APIRoute } from 'astro';
import { business } from '../config/business';
import { sitemapXml } from '../config/launch';
export const GET: APIRoute = () => {
  return new Response(sitemapXml(business.seo.siteUrl), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
