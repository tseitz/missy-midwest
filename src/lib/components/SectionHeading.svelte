<script lang="ts">
	interface Props {
		label: string;
		title: string;
	}
	let { label, title }: Props = $props();
</script>

<div class="mb-6">
	<div class="label-eyebrow">{label}</div>
	<h2 class="mt-2 text-4xl md:text-5xl">{title}</h2>
</div>
