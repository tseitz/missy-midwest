<script lang="ts">
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

	let dialogEl = $state<HTMLDialogElement>();
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
		if (event.key === 'ArrowLeft') return prev();
		if (event.key === 'ArrowRight') return next();
	}
	function onDialogClose() {
		if (index !== null) onClose();
	}

	$effect(() => {
		if (!dialogEl) return;
		if (current && !dialogEl.open) dialogEl.showModal();
		else if (!current && dialogEl.open) dialogEl.close();
	});
</script>

<dialog
	bind:this={dialogEl}
	aria-label={current?.caption}
	onclose={onDialogClose}
	onkeydown={onKeydown}
	class="m-0 h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-4 outline-none open:flex"
>
	{#if current}
		<button
			type="button"
			aria-label="Close"
			onclick={onClose}
			class="absolute top-4 right-4 z-20 text-2xl text-white/80 hover:text-white">✕</button
		>
		<button
			type="button"
			aria-label="Dismiss"
			tabindex="-1"
			class="absolute inset-0 h-full w-full cursor-default"
			onclick={onClose}
		></button>
		<div class="relative z-10 flex max-h-full max-w-3xl flex-col items-center">
			<img src={current.src} alt={current.caption} class="max-h-[80vh] w-auto rounded-xl" />
			<p class="text-trim mt-3 text-center text-sm">{current.caption}</p>
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
	{/if}
</dialog>

<style>
	dialog:modal {
		overscroll-behavior: contain;
	}
	dialog::backdrop {
		background: rgb(0 0 0 / 0.85);
		overflow: hidden;
		overscroll-behavior: contain;
	}
	@media (prefers-reduced-motion: no-preference) {
		dialog[open],
		dialog[open]::backdrop {
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
