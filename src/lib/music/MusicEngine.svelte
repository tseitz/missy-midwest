<script lang="ts">
	import { PROFILE_URL } from './soundcloud';
	import { createSoundCloudPlayer, type SCApi } from './soundcloud-player';
	import { player } from './player.svelte';

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

	let booting = false;
	// Runs once when the hidden iframe mounts (i.e. after the store first wants to
	// be active). Boots the SoundCloud engine and hands it to the store.
	async function boot(iframe: HTMLIFrameElement) {
		if (booting) return;
		booting = true;
		try {
			await loadApi();
			const SC = (window as unknown as { SC: SCApi }).SC;
			const engine = createSoundCloudPlayer({ SC, iframe, onState: player.sync });
			const tracks = await engine.init();
			player.connect(engine, tracks);
		} catch {
			player.fail();
		}
	}
</script>

{#if player.wantsActive}
	<!-- Hidden audio engine: rendered (not display:none) so playback works. -->
	<iframe
		{@attach (node) => void boot(node)}
		title="SoundCloud audio engine"
		aria-hidden="true"
		tabindex="-1"
		src={WIDGET_SRC}
		allow="autoplay; encrypted-media"
		style="position:absolute;width:1px;height:1px;left:-9999px;top:auto;border:0"
	></iframe>
{/if}
