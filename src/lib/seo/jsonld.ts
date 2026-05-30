import { SITE_NAME, DEFAULT_OG_IMAGE, SOCIAL_URLS } from './config';

export interface MusicGroupJsonLd {
	'@context': 'https://schema.org';
	'@type': 'MusicGroup';
	name: string;
	url: string;
	image: string;
	sameAs: string[];
}

/** Build the MusicGroup structured-data object for the given site origin. */
export function musicGroupJsonLd(origin: string): MusicGroupJsonLd {
	return {
		'@context': 'https://schema.org',
		'@type': 'MusicGroup',
		name: SITE_NAME,
		url: origin,
		image: `${origin}${DEFAULT_OG_IMAGE}`,
		sameAs: SOCIAL_URLS
	};
}
