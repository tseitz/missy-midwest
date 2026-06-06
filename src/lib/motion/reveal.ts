import type { Action } from 'svelte/action';

/**
 * Reveal-on-scroll: marks the node with `data-reveal`, then sets `data-revealed="true"`
 * once it scrolls into view (and stops observing). CSS animates the transition; a
 * `prefers-reduced-motion` guard makes it a no-op for users who opt out. If
 * IntersectionObserver is unavailable, the node is revealed immediately (no hidden content).
 */
export const reveal: Action = (node) => {
	node.setAttribute('data-reveal', '');
	if (typeof IntersectionObserver === 'undefined') {
		node.setAttribute('data-revealed', 'true');
		return;
	}
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.setAttribute('data-revealed', 'true');
					observer.disconnect();
				}
			}
		},
		{ rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
	);
	observer.observe(node);
	return { destroy: () => observer.disconnect() };
};
