import { google } from 'googleapis';
import { z } from 'zod';
import { createGoogleJwt } from './google-auth';
import { reportFailure, errorMessage } from './report';

const drive = google.drive('v3');

/** Google Drive file ids are URL-safe tokens; the param is URL-derived, so validate it. */
const fileIdSchema = z.string().regex(/^[A-Za-z0-9_-]{10,128}$/);

/** Posters are small; anything larger is almost certainly not a poster. */
const MAX_POSTER_BYTES = 10 * 1024 * 1024;

export interface PosterImage {
	// Backed by a plain ArrayBuffer (not ArrayBufferLike) so it's a valid Response body.
	bytes: Uint8Array<ArrayBuffer>;
	contentType: string;
}

/**
 * Download an event poster (a Google Drive image) by file id, using the
 * read-only service account. Returns null — and alerts — on anything we can't
 * serve (non-image, oversized, Drive error); a bad id is rejected quietly since
 * it's untrusted input, not an operational failure. Callers fall back to the
 * branded default poster.
 */
export async function getPosterImage(fileId: string): Promise<PosterImage | null> {
	if (!fileIdSchema.safeParse(fileId).success) {
		return null;
	}

	try {
		const auth = createGoogleJwt();

		const meta = await drive.files.get({ auth, fileId, fields: 'mimeType,size' });
		const contentType = meta.data.mimeType ?? '';
		const size = Number(meta.data.size ?? 0);

		if (!contentType.startsWith('image/')) {
			reportFailure(
				'Event poster rejected',
				`${fileId} is not an image (${contentType || 'unknown'})`
			);
			return null;
		}
		if (size > MAX_POSTER_BYTES) {
			reportFailure(
				'Event poster rejected',
				`${fileId} exceeds ${MAX_POSTER_BYTES} bytes (${size})`
			);
			return null;
		}

		const media = await drive.files.get(
			{ auth, fileId, alt: 'media' },
			{ responseType: 'arraybuffer' }
		);

		return { bytes: new Uint8Array(media.data as ArrayBuffer), contentType };
	} catch (error) {
		reportFailure('Drive poster fetch failed', `${fileId}: ${errorMessage(error)}`);
		return null;
	}
}
