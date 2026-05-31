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
		border: 1px solid transparent;
		border-radius: 999px;
		text-decoration: none;
		cursor: pointer;
		transition:
			transform 0.15s ease-out,
			box-shadow 0.15s ease-out,
			background-color 0.15s ease-out,
			border-color 0.15s ease-out,
			color 0.15s ease-out;
	}
	.btn:hover {
		transform: translateY(-1px);
	}
	.btn-fill {
		background: linear-gradient(90deg, var(--color-missy-blush), var(--color-lake-sunrise));
		color: var(--color-missy-ink);
		box-shadow: 0 6px 22px rgba(248, 151, 29, 0.4);
	}
	.btn-fill:hover {
		border-color: transparent;
		box-shadow: 0 8px 28px rgba(248, 151, 29, 0.55);
	}
	.btn-outline {
		background: transparent;
		border-color: var(--color-missy-classic-lavender);
		color: var(--color-missy-classic-lavender);
	}
	.btn-outline:hover {
		border-color: var(--color-missy-blush);
		color: var(--color-missy-blush);
		background: color-mix(in srgb, var(--color-missy-classic-lavender) 14%, transparent);
		box-shadow: 0 4px 18px rgba(199, 168, 234, 0.2);
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
