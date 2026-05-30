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
			class="aria-pressed:border-missy-classic-lavender aria-pressed:text-missy-classic-lavender rounded-full border px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40"
		>
			{variant.label}
		</button>
	{/each}
</div>
