<script lang="ts">
	import { wrapTabFocus } from '$lib/a11y/focus-trap';

	export interface LightboxPhoto {
		src: string;
		caption: string;
	}

	interface Props {
		photos: LightboxPhoto[];
		index: number | null;
		onClose: () => void;
		onNavigate: (nextIndex: number) => void;
	}
	let { photos, index, onClose, onNavigate }: Props = $props();

	let dialogEl = $state<HTMLDivElement>();
	const current = $derived(index === null ? null : photos[index]);

	function prev() {
		if (index === null) return;
		onNavigate((index - 1 + photos.length) % photos.length);
	}
	function next() {
		if (index === null) return;
		onNavigate((index + 1) % photos.length);
	}
	function onKeydown(event: KeyboardEvent) {
		if (index === null) return;
		if (event.key === 'Escape') return onClose();
		if (event.key === 'ArrowLeft') return prev();
		if (event.key === 'ArrowRight') return next();
		if (event.key === 'Tab' && dialogEl) wrapTabFocus(dialogEl, event);
	}

	$effect(() => {
		if (current) dialogEl?.focus();
	});
</script>

<svelte:window onkeydown={onKeydown} />

{#if current}
	<div
		bind:this={dialogEl}
		role="dialog"
		aria-modal="true"
		aria-label={current.caption}
		tabindex="-1"
		class="lightbox fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 outline-none"
	>
		<button
			type="button"
			aria-label="Dismiss"
			class="absolute inset-0 h-full w-full cursor-default"
			onclick={onClose}
		></button>
		<div class="relative z-10 flex max-h-full max-w-3xl flex-col items-center">
			<img src={current.src} alt={current.caption} class="max-h-[80vh] w-auto rounded-lg" />
			<p class="text-missy-classic-lavender mt-3 text-center text-sm">{current.caption}</p>
		</div>
		<button
			type="button"
			aria-label="Previous"
			onclick={prev}
			class="absolute left-3 z-20 px-3 text-4xl text-white/80 hover:text-white">‹</button
		>
		<button
			type="button"
			aria-label="Next"
			onclick={next}
			class="absolute right-3 z-20 px-3 text-4xl text-white/80 hover:text-white">›</button
		>
		<button
			type="button"
			aria-label="Close"
			onclick={onClose}
			class="absolute top-4 right-4 z-20 text-2xl text-white/80 hover:text-white">✕</button
		>
	</div>
{/if}

<style>
	@media (prefers-reduced-motion: no-preference) {
		.lightbox {
			animation: lightbox-in 0.2s ease-out;
		}
		@keyframes lightbox-in {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}
	}
</style>
