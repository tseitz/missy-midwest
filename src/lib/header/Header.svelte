<script lang="ts">
	import Nav from '$lib/header/Nav.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
</script>

<header
	class="sticky top-0 z-30 w-full bg-missy-deep-purple/85 backdrop-blur-md border-b border-missy-classic-lavender/15"
>
	<div class="max-w-screen-2xl mx-auto h-16 px-4 md:px-8 flex items-center justify-between">
		<div class="hidden md:block"><SocialLinks size={22} /></div>
		<a href="/" class="missy-header text-lg md:text-xl tracking-wide text-white">MISSY MIDWEST</a>
		<Nav />
	</div>
</header>
