import { browser } from '$app/environment';
import type { ProductGroup, Variant } from './types';

const STORAGE_KEY = 'missy-cart';

export interface CartLine {
	priceId: string;
	productId: string;
	groupSlug: string;
	label: string; // "Classic Trucker — Lavender"
	image: string;
	unitPrice: number; // cents
	stock: number; // cached for client-side qty clamp; the server re-validates at checkout
	qty: number;
}

function clamp(qty: number, stock: number): number {
	return Math.max(1, Math.min(qty, stock));
}

export class Cart {
	lines = $state<CartLine[]>([]);
	open = $state(false);

	constructor(initial: CartLine[] = []) {
		this.lines = initial;
	}

	get count(): number {
		return this.lines.reduce((total, line) => total + line.qty, 0);
	}

	get subtotal(): number {
		return this.lines.reduce((total, line) => total + line.unitPrice * line.qty, 0);
	}

	add(variant: Variant, group: ProductGroup): void {
		const existing = this.lines.find((line) => line.priceId === variant.priceId);
		if (existing) {
			existing.qty = clamp(existing.qty + 1, variant.stock);
		} else {
			this.lines.push({
				priceId: variant.priceId,
				productId: variant.productId,
				groupSlug: group.slug,
				label: `${group.name} — ${variant.label}`,
				image: variant.image,
				unitPrice: variant.price,
				stock: variant.stock,
				qty: 1
			});
		}
		this.save();
	}

	setQty(priceId: string, qty: number): void {
		const line = this.lines.find((entry) => entry.priceId === priceId);
		if (!line) return;
		line.qty = clamp(qty, line.stock);
		this.save();
	}

	remove(priceId: string): void {
		this.lines = this.lines.filter((line) => line.priceId !== priceId);
		this.save();
	}

	clear(): void {
		this.lines = [];
		this.save();
	}

	private save(): void {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lines));
		} catch (err) {
			console.warn('Could not persist cart to localStorage:', err);
		}
	}
}

function load(): CartLine[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as CartLine[]) : [];
	} catch {
		return [];
	}
}

export const cart = new Cart(load());
