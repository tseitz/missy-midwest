<script lang="ts">
	import { onMount } from 'svelte';
	import { PROFILE_URL, type FeaturedMix as FeaturedMixData } from './soundcloud';
	import {
		createSoundCloudPlayer,
		type Track,
		type PlayerState,
		type SCApi
	} from './soundcloud-player';
	import { setPlayerStore, type PlayerStore } from './player-context';
	import FeaturedMix from './FeaturedMix.svelte';
	import LatestTrack from './LatestTrack.svelte';
	import CatalogList from './CatalogList.svelte';

	let { featuredMix }: { featuredMix: FeaturedMixData | null } = $props();

	let status = $state<'idle' | 'loading' | 'ready' | 'error'>('idle');
	let tracks = $state<Track[]>([]);
	let playback = $state<PlayerState>({
		currentUrl: null,
		isPlaying: false,
		positionMs: 0,
		durationMs: 0
	});
	let iframe: HTMLIFrameElement;
	let player: ReturnType<typeof createSoundCloudPlayer> | null = null;

	const WIDGET_SRC =
		`https://w.soundcloud.com/player/?url=${encodeURIComponent(PROFILE_URL)}` +
		`&color=%23cbb1fa&auto_play=false&hide_related=true&show_comments=false&visual=false`;

	function loadApi(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (typeof window === 'undefined') return reject(new Error('no window'));
			const w = window as unknown as { SC?: unknown };
			if (w.SC) return resolve();
			const script = document.createElement('script');
			script.src = 'https://w.soundcloud.com/player/api.js';
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('SoundCloud api.js failed'));
			document.head.appendChild(script);
		});
	}

	let started = false;
	async function start() {
		if (started) return;
		started = true;
		status = 'loading';
		try {
			await loadApi();
			const SC = (window as unknown as { SC: SCApi }).SC;
			player = createSoundCloudPlayer({ SC, iframe, onState: (s) => (playback = s) });
			tracks = await player.init();
			status = tracks.length > 0 ? 'ready' : 'error';
		} catch {
			status = 'error';
		}
	}

	const store: PlayerStore = {
		get status() {
			return status;
		},
		get tracks() {
			return tracks;
		},
		get state() {
			return playback;
		},
		play: (url: string) => {
			void start().then(() => player?.playTrack(url));
		},
		toggle: () => player?.togglePlay()
	};
	setPlayerStore(store);

	onMount(() => {
		// Warm the engine after first paint without blocking it.
		const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
			.requestIdleCallback;
		if (ric) ric(() => void start());
		else setTimeout(() => void start(), 1200);
	});
</script>

<!-- Hidden audio engine: rendered (not display:none) so playback works. -->
<iframe
	bind:this={iframe}
	title="SoundCloud audio engine"
	aria-hidden="true"
	tabindex="-1"
	src={WIDGET_SRC}
	style="position:absolute;width:1px;height:1px;left:-9999px;top:auto;border:0"
></iframe>

<div class="flex w-full flex-col items-center">
	<LatestTrack />
	<FeaturedMix {featuredMix} />
	<CatalogList />
</div>
