import { getContext, setContext } from 'svelte';
import type { Track, PlayerState } from './soundcloud-player';

const KEY = Symbol('music-player');

/** Reactive view of the shared player the section components consume. */
export interface PlayerStore {
	readonly status: 'idle' | 'loading' | 'ready' | 'error';
	readonly tracks: Track[];
	readonly state: PlayerState;
	play(url: string): void;
	toggle(): void;
}

export function setPlayerStore(store: PlayerStore): void {
	setContext(KEY, store);
}
export function getPlayerStore(): PlayerStore {
	return getContext<PlayerStore>(KEY);
}
