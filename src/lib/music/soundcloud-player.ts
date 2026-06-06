export interface Track {
	id: number;
	title: string;
	durationMs: number;
	artworkUrl: string | null;
	permalinkUrl: string;
}

interface SCSound {
	id: number;
	title: string;
	duration: number;
	permalink_url: string;
	artwork_url: string | null;
}

export interface PlayerState {
	currentUrl: string | null;
	isPlaying: boolean;
	positionMs: number;
	durationMs: number;
	title: string | null;
	artworkUrl: string | null;
}

/** Map a raw SoundCloud widget sound to our minimal Track, upsizing artwork. */
export function mapSound(s: SCSound): Track {
	return {
		id: s.id,
		title: s.title,
		durationMs: s.duration,
		artworkUrl: s.artwork_url ? s.artwork_url.replace(/-(?:large|t\d+x\d+)\./, '-t500x500.') : null,
		permalinkUrl: s.permalink_url
	};
}

interface SCWidget {
	bind(event: string, cb: (data?: { currentPosition?: number }) => void): void;
	getSounds(cb: (sounds: SCSound[]) => void): void;
	getCurrentSound(cb: (sound: SCSound | null) => void): void;
	getDuration(cb: (ms: number) => void): void;
	load(url: string, options: { auto_play?: boolean; callback?: () => void }): void;
	play(): void;
	pause(): void;
	seekTo(ms: number): void;
}

export interface SCApi {
	Widget: ((iframe: HTMLIFrameElement) => SCWidget) & {
		Events: { READY: string; PLAY: string; PAUSE: string; FINISH: string; PLAY_PROGRESS: string };
	};
}

export interface PlayerDeps {
	SC: SCApi;
	iframe: HTMLIFrameElement;
	onState: (state: PlayerState) => void;
}

export function createSoundCloudPlayer({ SC, iframe, onState }: PlayerDeps) {
	const widget = SC.Widget(iframe);
	const E = SC.Widget.Events;
	const state: PlayerState = {
		currentUrl: null,
		isPlaying: false,
		positionMs: 0,
		durationMs: 0,
		title: null,
		artworkUrl: null
	};
	const emit = () => onState({ ...state });

	/** Pull the now-playing sound's title/artwork/duration from the widget. */
	const refreshMeta = () => {
		widget.getCurrentSound((sound) => {
			if (sound) {
				const t = mapSound(sound);
				state.title = t.title;
				state.artworkUrl = t.artworkUrl;
			}
			emit();
		});
		widget.getDuration((ms) => {
			state.durationMs = ms;
			emit();
		});
	};

	widget.bind(E.PLAY, () => {
		state.isPlaying = true;
		refreshMeta();
		emit();
	});
	widget.bind(E.PAUSE, () => {
		state.isPlaying = false;
		emit();
	});
	widget.bind(E.FINISH, () => {
		state.isPlaying = false;
		state.positionMs = 0;
		emit();
	});
	widget.bind(E.PLAY_PROGRESS, (d) => {
		state.positionMs = d?.currentPosition ?? 0;
		emit();
	});

	return {
		/**
		 * Resolve the profile's tracks once the widget is READY. Rejects after
		 * `timeoutMs` if READY never fires (SoundCloud unreachable) so callers can
		 * fall back instead of showing the skeleton forever.
		 */
		init(timeoutMs = 15000): Promise<Track[]> {
			return new Promise((resolve, reject) => {
				const timer = setTimeout(
					() => reject(new Error('SoundCloud widget READY timed out')),
					timeoutMs
				);
				widget.bind(E.READY, () => {
					clearTimeout(timer);
					widget.getSounds((sounds) => resolve(sounds.map(mapSound)));
				});
			});
		},
		/** Uniform play: load any track URL (mix or catalog item) and auto-play. */
		playTrack(url: string): void {
			state.currentUrl = url;
			state.title = null;
			state.artworkUrl = null;
			state.positionMs = 0;
			state.durationMs = 0;
			emit();
			widget.load(url, { auto_play: true, callback: () => widget.play() });
		},
		togglePlay(): void {
			if (state.isPlaying) widget.pause();
			else widget.play();
		},
		/** Seek to an absolute position; optimistically reflect it immediately. */
		seek(ms: number): void {
			widget.seekTo(ms);
			state.positionMs = ms;
			emit();
		}
	};
}
