<script lang="ts">
	import { resolve } from '$app/paths';
	import Nav from '$lib/header/Nav.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import { cart } from '$lib/shop/cart.svelte';
</script>

<header
	class="bg-missy-deep-purple/85 border-missy-classic-lavender/15 sticky top-0 z-30 w-full border-b backdrop-blur-md"
>
	<div class="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
		<div class="hidden md:block"><SocialLinks size={22} /></div>
		<a href={resolve('/')} class="missy-header text-lg tracking-wide text-white md:text-xl"
			>MISSY MIDWEST</a
		>
		<div class="flex items-center gap-4">
			<Nav />
			<button
				type="button"
				aria-label="Open cart"
				class="relative"
				onclick={() => (cart.open = true)}
			>
				<span aria-hidden="true">🛒</span>
				{#if cart.count > 0}
					<span
						class="bg-missy-classic-lavender absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-[#3a1233]"
					>
						{cart.count}
					</span>
				{/if}
			</button>
		</div>
	</div>
</header>
