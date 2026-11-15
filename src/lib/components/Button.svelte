<script lang="ts">
	interface Props {
		label: string;
		href?: string;
		variant?: 'fill' | 'outline';
		type?: 'button' | 'submit';
		disabled?: boolean;
		onclick?: () => void;
		/** Stretch to fill the container width (centered) — e.g. the cart checkout CTA. */
		block?: boolean;
		external?: boolean;
	}
	let {
		label,
		href,
		variant = 'fill',
		type = 'button',
		disabled = false,
		onclick,
		block = false,
		external = false
	}: Props = $props();

	const cls = $derived(`btn btn-${variant}${block ? ' btn-block' : ''}`);
</script>

{#if href}
	<!-- href is already final: callers pass resolve()/asset() output or an external URL -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		{href}
		class={cls}
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener noreferrer' : undefined}>{label}</a
	>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else}
	<button class={cls} {type} {disabled} {onclick}>{label}</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		white-space: nowrap;
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
	.btn-block {
		display: flex;
		width: 100%;
		justify-content: center;
	}
	.btn-fill {
		background: var(--gradient-brand);
		/* No border: a transparent one shows a 1px ring of the backdrop, or a seam at
		   the caps with border-box clip. +1px padding keeps it the outline's size. */
		border: 0;
		padding: calc(0.7rem + 1px) calc(1.4rem + 1px);
		color: var(--color-on-accent);
		box-shadow: 0 6px 22px color-mix(in srgb, var(--color-accent) 42%, transparent);
	}
	.btn-fill:hover {
		box-shadow: 0 8px 28px color-mix(in srgb, var(--color-accent) 55%, transparent);
	}
	.btn-outline {
		background: color-mix(in srgb, var(--color-fg) 6%, transparent);
		border-color: color-mix(in srgb, var(--color-fg) 70%, transparent);
		color: var(--color-fg);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
	}
	.btn-outline:hover {
		border-color: var(--color-fg);
		background: color-mix(in srgb, var(--color-fg) 14%, transparent);
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
