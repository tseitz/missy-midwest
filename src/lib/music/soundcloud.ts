/**
 * Client-safe SoundCloud constants + types.
 *
 * These are referenced by browser components (the player widget URL, the
 * featured-mix shape), so they must NOT live in `$lib/server/` — SvelteKit
 * blocks importing server-only modules into client code. The server module
 * (`$lib/server/soundcloud.ts`) re-exports these for its own use.
 */

/** Missy's public SoundCloud profile — source for the latest track + catalog. */
export const PROFILE_URL = 'https://soundcloud.com/missymidwest';

export interface FeaturedMix {
	title: string;
	artworkUrl: string;
	permalinkUrl: string;
}

export interface PlaylistTrack {
	title: string;
	permalinkUrl: string;
}

export interface FeaturedPlaylist extends FeaturedMix {
	tracks: PlaylistTrack[];
}

export const BAD_BITCH_BASS_URL = 'https://soundcloud.com/missymidwest/sets/bad-bitch-bass-vol-1';
