/** Format a price in cents as a USD string, e.g. 3200 -> "$32.00". */
export function formatPrice(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}

export interface StockStatus {
	soldOut: boolean;
	low: boolean;
	label: string;
}

/** Derive a display status from a stock count. Low threshold = 5. */
export function stockStatus(stock: number): StockStatus {
	if (stock <= 0) return { soldOut: true, low: false, label: 'Sold out' };
	if (stock <= 5) return { soldOut: false, low: true, label: `Only ${stock} left` };
	return { soldOut: false, low: false, label: 'In stock' };
}
