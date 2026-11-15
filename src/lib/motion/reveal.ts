import type { Action } from 'svelte/action';

const nativeReveal = () =>
	typeof CSS !== 'undefined' &&
	typeof CSS.supports === 'function' &&
	CSS.supports('(animation-timeline: view()) and (animation-range: entry)');

/** Fallback only: app.css animates `[data-reveal]` natively where supported. */
export const reveal: Action = (node) => {
	if (nativeReveal() || typeof IntersectionObserver === 'undefined') return;
	node.setAttribute('data-revealed', 'false');
	const observer = new IntersectionObserver(
		(entries) => {
			if (entries.some((entry) => entry.isIntersecting)) {
				node.setAttribute('data-revealed', 'true');
				observer.disconnect();
			}
		},
		// Threshold 0: a section taller than the viewport never reaches a ratio threshold.
		{ rootMargin: '0px 0px -10% 0px', threshold: 0 }
	);
	observer.observe(node);
	return { destroy: () => observer.disconnect() };
};
