<script lang="ts">
	let {
		positionMs,
		durationMs,
		onSeek
	}: { positionMs: number; durationMs: number; onSeek: (ms: number) => void } = $props();

	const STEP = 5000;
	const pct = $derived(durationMs > 0 ? Math.min(100, (positionMs / durationMs) * 100) : 0);

	function seekFromClientX(clientX: number, track: HTMLElement) {
		if (durationMs <= 0) return;
		const rect = track.getBoundingClientRect();
		const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
		onSeek(Math.round(ratio * durationMs));
	}

	function onPointerDown(e: PointerEvent) {
		const track = e.currentTarget as HTMLElement;
		seekFromClientX(e.clientX, track);
		const move = (ev: PointerEvent) => seekFromClientX(ev.clientX, track);
		const up = () => {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
		};
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
	}

	function onKeydown(e: KeyboardEvent) {
		if (durationMs <= 0) return;
		if (e.key === 'ArrowRight') onSeek(Math.min(durationMs, positionMs + STEP));
		else if (e.key === 'ArrowLeft') onSeek(Math.max(0, positionMs - STEP));
		else if (e.key === 'Home') onSeek(0);
		else if (e.key === 'End') onSeek(durationMs);
		else return;
		e.preventDefault();
	}
</script>

<div
	role="slider"
	tabindex="0"
	aria-label="Seek"
	aria-valuemin={0}
	aria-valuemax={durationMs}
	aria-valuenow={positionMs}
	onpointerdown={onPointerDown}
	onkeydown={onKeydown}
	class="bg-missy-classic-lavender/20 relative h-2 w-full cursor-pointer rounded-full"
>
	<div class="bg-missy-blush pointer-events-none h-full rounded-full" style="width:{pct}%"></div>
</div>
