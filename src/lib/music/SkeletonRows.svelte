<script lang="ts">
	let { rows = 5 }: { rows?: number } = $props();
</script>

<div class="w-full">
	{#each Array(rows), i (i)}
		<div class="border-missy-classic-lavender/10 flex items-center gap-4 border-t py-3">
			<div class="bg-missy-classic-lavender/10 h-8 w-8 animate-pulse rounded-full"></div>
			<div class="bg-missy-classic-lavender/10 h-3 flex-1 animate-pulse rounded"></div>
		</div>
	{/each}
</div>
