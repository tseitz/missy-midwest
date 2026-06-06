import { describe, it, expect, vi } from 'vitest';
import { mapSound, createSoundCloudPlayer } from './soundcloud-player';

describe('mapSound', () => {
	it('projects + upsizes artwork', () => {
		expect(
			mapSound({
				id: 1,
				title: 'T',
				duration: 1000,
				permalink_url: 'p',
				artwork_url: 'https://i1.sndcdn.com/x-large.jpg'
			})
		).toEqual({
			id: 1,
			title: 'T',
			durationMs: 1000,
			artworkUrl: 'https://i1.sndcdn.com/x-t500x500.jpg',
			permalinkUrl: 'p'
		});
	});
	it('tolerates missing artwork', () => {
		expect(
			mapSound({ id: 2, title: 'T', duration: 0, permalink_url: 'p', artwork_url: null }).artworkUrl
		).toBeNull();
	});
});

describe('createSoundCloudPlayer', () => {
	function fakeWidget() {
		const handlers: Record<string, (d?: unknown) => void> = {};
		return {
			bind: vi.fn((e: string, cb: (d?: unknown) => void) => {
				handlers[e] = cb;
			}),
			getSounds: vi.fn((cb: (s: unknown[]) => void) =>
				cb([
					{ id: 1, title: 'A', duration: 1000, permalink_url: 'urlA', artwork_url: null },
					{ id: 2, title: 'B', duration: 2000, permalink_url: 'urlB', artwork_url: null }
				])
			),
			load: vi.fn((_url: string, opts: { callback?: () => void }) => opts.callback?.()),
			play: vi.fn(),
			pause: vi.fn(),
			seekTo: vi.fn(),
			__fire: (e: string, d?: unknown) => handlers[e]?.(d)
		};
	}
	function fakeSC(widget: ReturnType<typeof fakeWidget>) {
		return {
			Widget: Object.assign(() => widget, {
				Events: {
					READY: 'ready',
					PLAY: 'play',
					PAUSE: 'pause',
					FINISH: 'finish',
					PLAY_PROGRESS: 'progress'
				}
			})
		};
	}

	it('init resolves the mapped track list on READY', async () => {
		const w = fakeWidget();
		const player = createSoundCloudPlayer({
			SC: fakeSC(w),
			iframe: {} as HTMLIFrameElement,
			onState: vi.fn()
		});
		const ready = player.init();
		w.__fire('ready');
		const tracks = await ready;
		expect(tracks.map((t) => t.title)).toEqual(['A', 'B']);
	});

	it('init rejects when READY never fires before the timeout', async () => {
		vi.useFakeTimers();
		const w = fakeWidget();
		const player = createSoundCloudPlayer({
			SC: fakeSC(w),
			iframe: {} as HTMLIFrameElement,
			onState: vi.fn()
		});
		const ready = player.init(1000);
		const assertion = expect(ready).rejects.toThrow(/timed out/);
		vi.advanceTimersByTime(1000);
		await assertion;
		vi.useRealTimers();
	});

	it('playTrack loads the url with auto_play and emits playing state', async () => {
		const w = fakeWidget();
		const onState = vi.fn();
		const player = createSoundCloudPlayer({
			SC: fakeSC(w),
			iframe: {} as HTMLIFrameElement,
			onState
		});
		const ready = player.init();
		w.__fire('ready');
		await ready;
		player.playTrack('urlB');
		expect(w.load).toHaveBeenCalledWith('urlB', expect.objectContaining({ auto_play: true }));
		w.__fire('play');
		expect(onState).toHaveBeenCalledWith(
			expect.objectContaining({ currentUrl: 'urlB', isPlaying: true })
		);
	});
});
