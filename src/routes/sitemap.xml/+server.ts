import { listGroups } from '$lib/server/catalog';
import type { RequestHandler } from './$types';

const STATIC_PATHS = ['/', '/music', '/shows', '/contact', '/shop'];

export const GET: RequestHandler = async ({ url }) => {
	const { groups } = await listGroups();
	const paths = [...STATIC_PATHS, ...groups.map((group) => `/shop/${group.slug}`)];
	const entries = paths.map((path) => `\t<url><loc>${url.origin}${path}</loc></url>`).join('\n');
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
	return new Response(body, {
		headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'max-age=3600' }
	});
};
