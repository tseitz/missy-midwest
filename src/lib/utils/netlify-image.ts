import { dev } from '$app/environment';

export type ImageFormat = 'webp' | 'avif' | 'jpg' | 'png';

export interface NetlifyImageOptions {
	width: number;
	format?: ImageFormat;
	quality?: number;
}

/**
 * Wrap a same-origin image path in Netlify's Image CDN so it's resized and
 * recompressed at the edge (and cached). Works for dynamic, function-served
 * sources too — e.g. our `/api/event-poster/[fileId]` proxy — turning a
 * multi-MB Drive photo into a ~150KB WebP without changing the upload workflow.
 *
 * The `/.netlify/images` endpoint only exists on Netlify; in local Vite dev it
 * 404s, so fall back to the original path there.
 */
export function netlifyImage(
	path: string,
	{ width, format = 'webp', quality = 75 }: NetlifyImageOptions
): string {
	if (dev) return path;
	const params = new URLSearchParams({
		url: path,
		w: String(width),
		fm: format,
		q: String(quality)
	});
	return `/.netlify/images?${params.toString()}`;
}

/**
 * Build a width-descriptor `srcset` for `path` across `widths`, so the browser
 * fetches the size it actually needs (smaller on phones, sharp on retina).
 */
export function netlifyImageSrcset(
	path: string,
	widths: number[],
	options: Omit<NetlifyImageOptions, 'width'> = {}
): string {
	return widths.map((w) => `${netlifyImage(path, { ...options, width: w })} ${w}w`).join(', ');
}
