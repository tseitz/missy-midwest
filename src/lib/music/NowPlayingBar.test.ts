import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import NowPlayingBar from './NowPlayingBar.svelte';
import { player } from './player.svelte';

beforeEach(() => {
	player.reset();
});

describe('NowPlayingBar', () => {
	it('renders nothing until something is playing', () => {
		render(NowPlayingBar);
		expect(screen.queryByRole('slider', { name: /seek/i })).not.toBeInTheDocument();
	});

	it('shows the title and time readout once a track is current', () => {
		player.state = {
			currentUrl: 'urlB',
			isPlaying: true,
			positionMs: 30000,
			durationMs: 4124000, // 1:08:44
			title: 'Summer Mix',
			artworkUrl: null
		};
		render(NowPlayingBar);
		expect(screen.getByText('Summer Mix')).toBeInTheDocument();
		expect(screen.getByText('0:30 / 1:08:44')).toBeInTheDocument();
		expect(screen.getByRole('slider', { name: /seek/i })).toBeInTheDocument();
	});

	it('the play/pause button toggles the store', async () => {
		player.state = {
			currentUrl: 'urlB',
			isPlaying: true,
			positionMs: 0,
			durationMs: 1000,
			title: 'X',
			artworkUrl: null
		};
		const toggle = vi.spyOn(player, 'toggle');
		render(NowPlayingBar);
		await screen.getByRole('button', { name: /pause/i }).click();
		expect(toggle).toHaveBeenCalled();
	});
});
