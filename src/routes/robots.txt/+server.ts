import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const body = `User-agent: *\nAllow: /\n\nSitemap: ${url.origin}/sitemap.xml\n`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
