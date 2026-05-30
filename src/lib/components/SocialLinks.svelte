<script lang="ts">
	import {
		SiSoundcloud,
		SiTiktok,
		SiTwitch,
		SiInstagram,
		SiFacebook,
		SiYoutube
	} from '@icons-pack/svelte-simple-icons';

	interface Props {
		size?: number;
	}
	let { size = 24 }: Props = $props();

	const color = 'var(--color-missy-classic-lavender)';
	const socials = [
		{ href: 'https://soundcloud.com/missymidwest', Icon: SiSoundcloud, label: 'SoundCloud' },
		{ href: 'https://www.instagram.com/missy.midwest/', Icon: SiInstagram, label: 'Instagram' },
		{ href: 'https://www.tiktok.com/@missy.midwestofficial', Icon: SiTiktok, label: 'TikTok' },
		{ href: 'https://www.twitch.tv/missymidwest', Icon: SiTwitch, label: 'Twitch' },
		{ href: 'https://www.facebook.com/MissyMidwest/', Icon: SiFacebook, label: 'Facebook' },
		{
			href: 'https://www.youtube.com/channel/UCG4fK0SGXZpW6FJfGblgIqg',
			Icon: SiYoutube,
			label: 'YouTube'
		}
	];
</script>

<div class="flex items-center gap-4">
	{#each socials as { href, Icon, label } (href)}
		<a {href} target="_blank" rel="noreferrer" aria-label={label} class="social">
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
