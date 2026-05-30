import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Lightbox from './Lightbox.svelte';

const photos = [
	{ src: '/a.webp', caption: 'Electric Forest' },
	{ src: '/b.webp', caption: 'Camp Taco' }
];

describe('Lightbox', () => {
	it('renders nothing when index is null', () => {
		render(Lightbox, { props: { photos, index: null, onClose: () => {}, onNavigate: () => {} } });
		expect(screen.queryByRole('dialog')).toBeNull();
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
