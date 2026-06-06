import { describe, it, expect, beforeEach, vi } from 'vitest';
import { player } from './player.svelte';
import type { Track } from './soundcloud-player';

const TRACKS: Track[] = [
	{ id: 1, title: 'A', durationMs: 1000, artworkUrl: null, permalinkUrl: 'urlA' },
	{ id: 2, title: 'B', durationMs: 2000, artworkUrl: null, permalinkUrl: 'urlB' }
];

function fakeEngine() {
	return {
		init: vi.fn(async () => TRACKS),
		playTrack: vi.fn(),
		togglePlay: vi.fn(),
		seek: vi.fn()
	};
}

beforeEach(() => {
	player.reset();
});

describe('player store', () => {
	it('starts idle and inactive', () => {
		expect(player.status).toBe('idle');
		expect(player.wantsActive).toBe(false);
		expect(player.state.currentUrl).toBeNull();
	});

	it('warm() requests activation without playing', () => {
		player.warm();
		expect(player.wantsActive).toBe(true);
	});

	it('queues a play requested before the engine connects, then flushes on connect', () => {
		player.play('urlB');
		expect(player.wantsActive).toBe(true);
		const engine = fakeEngine();
		player.connect(engine, TRACKS);
		expect(player.status).toBe('ready');
		expect(player.tracks).toHaveLength(2);
		expect(engine.playTrack).toHaveBeenCalledWith('urlB');
	});

	it('plays immediately once connected', () => {
		const engine = fakeEngine();
		player.connect(engine, TRACKS);
		player.play('urlA');
		expect(engine.playTrack).toHaveBeenCalledWith('urlA');
	});

	it('delegates toggle and seek to the engine', () => {
		const engine = fakeEngine();
		player.connect(engine, TRACKS);
		player.toggle();
		player.seek(500);
		expect(engine.togglePlay).toHaveBeenCalled();
		expect(engine.seek).toHaveBeenCalledWith(500);
	});

	it('connect with no tracks marks the store errored', () => {
		player.connect(fakeEngine(), []);
		expect(player.status).toBe('error');
	});
});
