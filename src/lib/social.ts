/**
 * Missy's public social profiles — the single source for the on-page icon row
 * (`SocialLinks.svelte`) and the JSON-LD `sameAs` list (`seo/config.ts`). Icons
 * are mapped by `key` inside `SocialLinks.svelte` so this module stays free of
 * Svelte imports and can be used from the server-rendered SEO path.
 */
export const SOCIAL_LINKS = [
	{ key: 'soundcloud', href: 'https://soundcloud.com/missymidwest', label: 'SoundCloud' },
	{ key: 'instagram', href: 'https://www.instagram.com/missy.midwest/', label: 'Instagram' },
	{ key: 'tiktok', href: 'https://www.tiktok.com/@missy.midwestofficial', label: 'TikTok' },
	{ key: 'twitch', href: 'https://www.twitch.tv/missymidwest', label: 'Twitch' },
	{ key: 'facebook', href: 'https://www.facebook.com/MissyMidwest/', label: 'Facebook' },
	{
		key: 'youtube',
		href: 'https://www.youtube.com/channel/UCG4fK0SGXZpW6FJfGblgIqg',
		label: 'YouTube'
	}
] as const;

/** Profile URLs only — used for JSON-LD `sameAs`. */
export const SOCIAL_URLS: string[] = SOCIAL_LINKS.map((s) => s.href);
