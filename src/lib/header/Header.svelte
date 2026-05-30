<script lang="ts">
	import { resolve } from '$app/paths';
	import Nav from '$lib/header/Nav.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
</script>

<header
	class="bg-missy-deep-purple/85 border-missy-classic-lavender/15 sticky top-0 z-30 w-full border-b backdrop-blur-md"
>
	<div class="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
		<div class="hidden md:block"><SocialLinks size={22} /></div>
		<a href={resolve('/')} class="missy-header text-lg tracking-wide text-white md:text-xl"
			>MISSY MIDWEST</a
		>
		<Nav />
	</div>
</header>
