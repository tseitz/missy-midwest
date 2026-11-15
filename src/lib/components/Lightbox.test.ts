import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeAll, describe, it, expect, vi } from 'vitest';
import Lightbox from './Lightbox.svelte';

const photos = [
	{ src: '/a.webp', caption: 'Electric Forest' },
	{ src: '/b.webp', caption: 'Camp Taco' }
];

beforeAll(() => {
	HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
		this.open = true;
	};
	HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
		this.open = false;
		this.dispatchEvent(new Event('close'));
	};
});

describe('Lightbox', () => {
	it('stays closed and shows no photo when index is null', () => {
		const { container } = render(Lightbox, {
			props: { photos, index: null, onClose: () => {}, onNavigate: () => {} }
		});
		expect(container.querySelector('dialog')?.open).toBe(false);
		expect(screen.queryByRole('img')).toBeNull();
	});

	it('opens the dialog when index is set', () => {
		const { container } = render(Lightbox, {
			props: { photos, index: 0, onClose: () => {}, onNavigate: () => {} }
		});
		expect(container.querySelector('dialog')?.open).toBe(true);
	});

	it('calls onClose once on a native close, as Esc fires', async () => {
		const onClose = vi.fn();
		const { container } = render(Lightbox, {
			props: { photos, index: 0, onClose, onNavigate: () => {} }
		});
		await fireEvent(container.querySelector('dialog')!, new Event('close'));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('navigates to the next photo on ArrowRight', async () => {
		const onNavigate = vi.fn();
		const { container } = render(Lightbox, {
			props: { photos, index: 0, onClose: () => {}, onNavigate }
		});
		await fireEvent.keyDown(container.querySelector('dialog')!, { key: 'ArrowRight' });
		expect(onNavigate).toHaveBeenCalledWith(1);
	});

	it('shows the photo and caption at the open index', () => {
		render(Lightbox, { props: { photos, index: 0, onClose: () => {}, onNavigate: () => {} } });
		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText('Electric Forest')).toBeInTheDocument();
		expect(screen.getByRole('img')).toHaveAttribute('src', '/a.webp');
	});

	it('calls onClose when the close button is clicked', async () => {
		const onClose = vi.fn();
		render(Lightbox, { props: { photos, index: 0, onClose, onNavigate: () => {} } });
		await screen.getByRole('button', { name: /close/i }).click();
		expect(onClose).toHaveBeenCalled();
	});

	it('navigates to the next photo, wrapping from the last to the first', async () => {
		const onNavigate = vi.fn();
		render(Lightbox, { props: { photos, index: 1, onClose: () => {}, onNavigate } });
		await screen.getByRole('button', { name: /next/i }).click();
		expect(onNavigate).toHaveBeenCalledWith(0);
	});

	it('navigates to the previous photo, wrapping from the first to the last', async () => {
		const onNavigate = vi.fn();
		render(Lightbox, { props: { photos, index: 0, onClose: () => {}, onNavigate } });
		await screen.getByRole('button', { name: /previous/i }).click();
		expect(onNavigate).toHaveBeenCalledWith(1);
	});
});
