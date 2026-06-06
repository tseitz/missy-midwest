import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ProgressBar from './ProgressBar.svelte';

describe('ProgressBar', () => {
	it('exposes slider aria values from props', () => {
		render(ProgressBar, { props: { positionMs: 30000, durationMs: 120000, onSeek: vi.fn() } });
		const slider = screen.getByRole('slider', { name: /seek/i });
		expect(slider).toHaveAttribute('aria-valuemin', '0');
		expect(slider).toHaveAttribute('aria-valuemax', '120000');
		expect(slider).toHaveAttribute('aria-valuenow', '30000');
	});

	it('arrow keys seek by 5s, clamped to the ends', async () => {
		const onSeek = vi.fn();
		render(ProgressBar, { props: { positionMs: 1000, durationMs: 120000, onSeek } });
		const slider = screen.getByRole('slider', { name: /seek/i });

		await slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		expect(onSeek).toHaveBeenLastCalledWith(6000);

		await slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
		expect(onSeek).toHaveBeenLastCalledWith(0); // 1000 - 5000 clamped to 0

		await slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
		expect(onSeek).toHaveBeenLastCalledWith(120000);

		await slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
		expect(onSeek).toHaveBeenLastCalledWith(0);
	});

	it('click seeks to the pointer position along the track', async () => {
		const onSeek = vi.fn();
		render(ProgressBar, { props: { positionMs: 0, durationMs: 100000, onSeek } });
		const slider = screen.getByRole('slider', { name: /seek/i });
		vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
			left: 0,
			width: 200,
			top: 0,
			right: 200,
			bottom: 8,
			height: 8,
			x: 0,
			y: 0,
			toJSON: () => ({})
		} as DOMRect);

		// jsdom has no PointerEvent constructor; a MouseEvent typed 'pointerdown'
		// triggers the same listener and carries clientX.
		await slider.dispatchEvent(new MouseEvent('pointerdown', { clientX: 100, bubbles: true }));
		expect(onSeek).toHaveBeenCalledWith(50000); // halfway → 50% of 100000
	});
});
