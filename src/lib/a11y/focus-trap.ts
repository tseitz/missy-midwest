/** Visible, focusable descendants of `container`, in DOM order. */
function focusableWithin(container: HTMLElement): HTMLElement[] {
	const selector =
		'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
	return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
		(el) => el.offsetParent !== null
	);
}

/**
 * On a Tab / Shift+Tab keydown, wrap focus so it stays within `container`.
 * No-op for non-Tab keys or when the container has no focusable children.
 */
export function wrapTabFocus(container: HTMLElement, event: KeyboardEvent): void {
	if (event.key !== 'Tab') return;
	const items = focusableWithin(container);
	if (items.length === 0) return;
	const first = items[0];
	const last = items[items.length - 1];
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

/**
 * Svelte attachment: trap Tab focus within the node, focus its first focusable
 * child on mount, and restore focus to the previously-focused element on unmount.
 */
export function trapFocus(node: HTMLElement): () => void {
	const previouslyFocused = document.activeElement as HTMLElement | null;
	focusableWithin(node)[0]?.focus();

	const onKeydown = (event: KeyboardEvent) => wrapTabFocus(node, event);
	node.addEventListener('keydown', onKeydown);

	return () => {
		node.removeEventListener('keydown', onKeydown);
		previouslyFocused?.focus();
	};
}
