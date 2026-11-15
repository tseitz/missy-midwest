<script lang="ts">
	import { asset } from '$app/paths';

	let { class: className = '' }: { class?: string } = $props();
</script>

<span
	role="img"
	aria-label="Missy Midwest"
	class="logo {className}"
	style="--logo-src: url({asset('/header/missy-midwest-logo-white.png')})"
></span>

<style>
	.logo {
		display: inline-block;
		aspect-ratio: 2551 / 375;
		background-color: currentColor;
		-webkit-mask: var(--logo-src) center / contain no-repeat;
		mask: var(--logo-src) center / contain no-repeat;
	}
</style>
