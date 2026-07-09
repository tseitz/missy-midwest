/** Format a price in cents as a USD string, e.g. 3200 -> "$32.00". */
export function formatPrice(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}

export interface StockStatus {
	soldOut: boolean;
	low: boolean;
	comingSoon: boolean;
	label: string;
}

/**
 * Derive a display status from a stock count. Low threshold = 5. A `restocking`
 * variant that's out of stock reads "Coming soon" but stays sold out (not
 * purchasable) — it's a relabeled sold-out, not a buyable state.
 */
export function stockStatus(stock: number, restocking = false): StockStatus {
	if (stock <= 0) {
		return restocking
			? { soldOut: true, low: false, comingSoon: true, label: 'Coming soon' }
			: { soldOut: true, low: false, comingSoon: false, label: 'Sold out' };
	}
	if (stock <= 5)
		return { soldOut: false, low: true, comingSoon: false, label: `Only ${stock} left` };
	return { soldOut: false, low: false, comingSoon: false, label: 'In stock' };
}
