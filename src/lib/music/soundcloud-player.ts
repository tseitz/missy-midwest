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
}

/** Map a raw SoundCloud widget sound to our minimal Track, upsizing artwork. */
export function mapSound(s: SCSound): Track {
	return {
		id: s.id,
		title: s.title,
		durationMs: s.duration,
		artworkUrl: s.artwork_url ? s.artwork_url.replace(/-large\./, '-t500x500.') : null,
		permalinkUrl: s.permalink_url
	};
}

interface SCWidget {
	bind(event: string, cb: (data?: { currentPosition?: number }) => void): void;
	getSounds(cb: (sounds: SCSound[]) => void): void;
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
	const state: PlayerState = { currentUrl: null, isPlaying: false, positionMs: 0, durationMs: 0 };
	const emit = () => onState({ ...state });

	widget.bind(E.PLAY, () => {
		state.isPlaying = true;
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
		/** Resolve the profile's tracks once the widget is READY. */
		init(): Promise<Track[]> {
			return new Promise((resolve) => {
				widget.bind(E.READY, () => widget.getSounds((sounds) => resolve(sounds.map(mapSound))));
			});
		},
		/** Uniform play: load any track URL (mix or catalog item) and auto-play. */
		playTrack(url: string): void {
			state.currentUrl = url;
			emit();
			widget.load(url, { auto_play: true, callback: () => widget.play() });
		},
		togglePlay(): void {
			if (state.isPlaying) widget.pause();
			else widget.play();
		},
		seek(ms: number): void {
			widget.seekTo(ms);
		}
	};
}
