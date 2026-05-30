import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import VariantSelector from './VariantSelector.svelte';
import type { Variant } from './types';

function variant(label: string, stock: number): Variant {
	return {
		priceId: `price_${label}`,
		productId: `prod_${label}`,
		label,
		image: '',
		price: 3000,
		stock
	};
}

describe('VariantSelector', () => {
	const variants = [variant('Lavender', 5), variant('Black', 0)];

	it('renders a button per variant', () => {
		render(VariantSelector, {
			props: { variants, variantType: 'color', selected: variants[0], onSelect: () => {} }
		});
		expect(screen.getByRole('button', { name: 'Lavender' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Black' })).toBeInTheDocument();
	});

	it('disables sold-out variants', () => {
		render(VariantSelector, {
			props: { variants, variantType: 'color', selected: variants[0], onSelect: () => {} }
		});
		expect(screen.getByRole('button', { name: 'Black' })).toBeDisabled();
	});

	it('marks the selected variant as pressed', () => {
		render(VariantSelector, {
			props: { variants, variantType: 'color', selected: variants[0], onSelect: () => {} }
		});
		expect(screen.getByRole('button', { name: 'Lavender' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	});

	it('calls onSelect when a variant is clicked', async () => {
		const onSelect = vi.fn();
		render(VariantSelector, {
			props: { variants, variantType: 'color', selected: variants[0], onSelect }
		});
		screen.getByRole('button', { name: 'Lavender' }).click();
		expect(onSelect).toHaveBeenCalledWith(variants[0]);
	});
});
