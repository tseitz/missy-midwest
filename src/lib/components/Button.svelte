<script lang="ts">
	interface Props {
		label: string;
		href?: string;
		variant?: 'fill' | 'outline';
		type?: 'button' | 'submit';
		disabled?: boolean;
		onclick?: () => void;
	}
	let {
		label,
		href,
		variant = 'fill',
		type = 'button',
		disabled = false,
		onclick
	}: Props = $props();

	const cls = $derived(`btn btn-${variant}`);
</script>

{#if href}
	<!-- href is already final: callers pass resolve()/asset() output or an external URL -->
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a {href} class={cls}>{label}</a>
{:else}
	<button class={cls} {type} {disabled} {onclick}>{label}</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-obviously);
		font-weight: 700;
		font-size: 0.85rem;
		padding: 0.7rem 1.4rem;
		border-radius: 999px;
		text-decoration: none;
		cursor: pointer;
		transition:
			transform 0.15s ease-out,
			box-shadow 0.15s ease-out;
	}
	.btn:hover {
		transform: translateY(-1px);
		border-bottom: none;
	}
	.btn-fill {
		background: linear-gradient(90deg, var(--color-missy-blush), var(--color-lake-sunrise));
		color: #3a1233;
		box-shadow: 0 6px 22px rgba(248, 151, 29, 0.4);
	}
	.btn-outline {
		background: transparent;
		border: 1px solid var(--color-missy-classic-lavender);
		color: var(--color-missy-classic-lavender);
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
