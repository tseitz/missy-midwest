<script lang="ts">
	let { playing }: { playing: boolean } = $props();
</script>

<svg class="h-[0.9em] w-[0.9em]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
	{#if playing}
		<rect x="6" y="5" width="4" height="14" rx="1" />
		<rect x="14" y="5" width="4" height="14" rx="1" />
	{:else}
		<path d="M8 5v14l11-7z" />
	{/if}
</svg>
