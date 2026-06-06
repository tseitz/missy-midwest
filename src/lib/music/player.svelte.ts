import type { createSoundCloudPlayer, Track, PlayerState } from './soundcloud-player';

type Engine = ReturnType<typeof createSoundCloudPlayer>;
type Status = 'idle' | 'loading' | 'ready' | 'error';

const INITIAL: PlayerState = {
	currentUrl: null,
	isPlaying: false,
	positionMs: 0,
	durationMs: 0,
	title: null,
	artworkUrl: null
};

/**
 * The single global music player. One instance backs the whole site: the
 * `/music` sections start playback, the sticky `NowPlayingBar` reads state, and
 * `MusicEngine` (mounted once in the root layout) supplies the live engine.
 */
class PlayerStore {
	status = $state<Status>('idle');
	tracks = $state<Track[]>([]);
	state = $state<PlayerState>({ ...INITIAL });
	/** MusicEngine watches this to know when to mount + boot the hidden iframe. */
	wantsActive = $state(false);

	#engine: Engine | null = null;
	#pendingUrl: string | null = null;

	/** Boot the engine without playing — the /music page's idle warm-up. */
	warm(): void {
		this.wantsActive = true;
		if (this.status === 'idle') this.status = 'loading';
	}

	/** Start playback of a track/mix URL. */
	play(url: string): void {
		this.wantsActive = true;
		if (this.#engine) {
			this.#engine.playTrack(url);
		} else {
			if (this.status === 'idle') this.status = 'loading';
			this.#pendingUrl = url;
		}
	}

	toggle(): void {
		this.#engine?.togglePlay();
	}

	seek(ms: number): void {
		this.#engine?.seek(ms);
	}

	/** onState target handed to createSoundCloudPlayer. */
	sync = (s: PlayerState): void => {
		this.state = s;
	};

	/** MusicEngine calls this once the widget is READY with resolved tracks. */
	connect(engine: Engine, tracks: Track[]): void {
		this.#engine = engine;
		this.tracks = tracks;
		this.status = tracks.length > 0 ? 'ready' : 'error';
		if (this.#pendingUrl) {
			engine.playTrack(this.#pendingUrl);
			this.#pendingUrl = null;
		}
	}

	/** MusicEngine calls this if booting throws (SoundCloud unreachable). */
	fail(): void {
		this.status = 'error';
		this.#pendingUrl = null;
	}

	/** Test helper — restore a pristine store between cases. */
	reset(): void {
		this.status = 'idle';
		this.tracks = [];
		this.state = { ...INITIAL };
		this.wantsActive = false;
		this.#engine = null;
		this.#pendingUrl = null;
	}
}

export const player = new PlayerStore();
