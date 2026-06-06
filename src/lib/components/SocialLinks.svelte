<script lang="ts">
	import {
		SiSoundcloud,
		SiTiktok,
		SiTwitch,
		SiInstagram,
		SiFacebook,
		SiYoutube
	} from '@icons-pack/svelte-simple-icons';
	import { SOCIAL_LINKS } from '$lib/social';

	interface Props {
		size?: number;
	}
	let { size = 24 }: Props = $props();

	const color = 'var(--color-missy-classic-lavender)';
	const icons = {
		soundcloud: SiSoundcloud,
		instagram: SiInstagram,
		tiktok: SiTiktok,
		twitch: SiTwitch,
		facebook: SiFacebook,
		youtube: SiYoutube
	};
</script>

<div class="flex items-center gap-4">
	{#each SOCIAL_LINKS as social (social.href)}
		{@const Icon = icons[social.key]}
		<!-- external social profile URLs; resolve() is for internal routes only -->
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} class="social">
			<Icon {size} {color} />
		</a>
	{/each}
</div>

<style>
	.social:hover {
		transform: scale(1.1);
		transition: transform 0.1s ease-out;
		border-bottom: none;
	}
</style>
