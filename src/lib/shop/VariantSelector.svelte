<script lang="ts">
	import type { Variant, VariantType } from './types';
	import { stockStatus } from './format';

	interface Props {
		variants: Variant[];
		variantType: VariantType | null;
		selected: Variant;
		onSelect: (variant: Variant) => void;
	}
	let { variants, variantType, selected, onSelect }: Props = $props();
</script>

<div
	role="group"
	aria-label={variantType === 'size' ? 'Size' : 'Color'}
	class="flex flex-wrap gap-2"
>
	{#each variants as variant (variant.priceId)}
		<button
			type="button"
			aria-pressed={variant.priceId === selected.priceId}
			disabled={stockStatus(variant.stock).soldOut}
			onclick={() => onSelect(variant)}
			class="min-w-12 rounded-full border border-missy-classic-lavender/30 px-4 py-2.5 text-center text-sm font-medium text-slate-50 transition hover:border-missy-blush hover:text-missy-blush aria-pressed:border-transparent aria-pressed:bg-missy-blush aria-pressed:font-semibold aria-pressed:text-missy-ink disabled:cursor-not-allowed disabled:text-slate-500 disabled:line-through disabled:opacity-50"
		>
			{variant.label}
		</button>
	{/each}
</div>
