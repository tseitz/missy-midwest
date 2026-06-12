<script lang="ts">
	import { cart } from './cart.svelte';
	import { formatPrice } from './format';

	let error = $state('');
	let submitting = $state(false);

	async function checkout() {
		submitting = true;
		error = '';
		try {
			const res = await fetch('/shop/checkout', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(
					cart.lines.map((line) => ({ priceId: line.priceId, quantity: line.qty }))
				)
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				error = data.message ?? 'Something went wrong. Please try again.';
				return;
			}
			const { url } = await res.json();
			location.href = url;
		} catch {
			error = 'Could not reach checkout. Please try again.';
		} finally {
			submitting = false;
		}
	}
</script>

{#if cart.open}
	<button
		type="button"
		aria-label="Close cart"
		class="fixed inset-0 z-40 bg-black/50"
		onclick={() => (cart.open = false)}
	></button>

	<aside
		class="bg-missy-deep-purple border-missy-classic-lavender/15 fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l p-6"
	>
		<div class="flex items-center justify-between">
			<h2 class="text-2xl">Your Cart</h2>
			<button type="button" aria-label="Close cart" onclick={() => (cart.open = false)}>✕</button>
		</div>

		{#if cart.lines.length === 0}
			<p class="mt-8 opacity-80">Your cart is empty.</p>
		{:else}
			<ul class="mt-6 flex-1 space-y-4 overflow-auto">
				{#each cart.lines as line (line.priceId)}
					<li class="flex gap-3">
						<div class="bg-missy-deep-purple/40 h-16 w-16 shrink-0 overflow-hidden rounded-md">
							{#if line.image}
								<img src={line.image} alt={line.label} class="h-full w-full object-cover" />
							{/if}
						</div>
						<div class="flex-1">
							<div class="text-sm font-semibold">{line.label}</div>
							<div class="text-missy-classic-lavender text-sm">{formatPrice(line.unitPrice)}</div>
							<div class="mt-1 flex items-center gap-2">
								<button
									type="button"
									aria-label="Decrease quantity"
									onclick={() => cart.setQty(line.priceId, line.qty - 1)}
									class="h-6 w-6 rounded border">−</button
								>
								<span class="w-6 text-center text-sm">{line.qty}</span>
								<button
									type="button"
									aria-label="Increase quantity"
									onclick={() => cart.setQty(line.priceId, line.qty + 1)}
									class="h-6 w-6 rounded border">+</button
								>
								<button
									type="button"
									aria-label="Remove item"
									onclick={() => cart.remove(line.priceId)}
									class="text-missy-muted hover:text-missy-secondary ml-auto text-xs underline transition"
									>Remove</button
								>
							</div>
						</div>
					</li>
				{/each}
			</ul>

			<div class="mt-6 border-t border-white/10 pt-4">
				<div class="flex justify-between text-lg">
					<span>Subtotal</span>
					<span>{formatPrice(cart.subtotal)}</span>
				</div>
				<p class="text-missy-muted mt-1 text-xs">Shipping calculated at checkout.</p>
				{#if error}
					<p class="mt-3 text-sm text-red-300">{error}</p>
				{/if}
				<button
					type="button"
					disabled={submitting}
					onclick={checkout}
					class="bg-missy-classic-lavender mt-4 w-full rounded-full py-3 font-semibold text-missy-ink disabled:opacity-50"
				>
					{submitting ? 'Redirecting…' : 'Checkout →'}
				</button>
			</div>
		{/if}
	</aside>
{/if}
