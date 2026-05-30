import '@testing-library/jest-dom/vitest';

// jsdom ships a non-functional `localStorage` stub (setItem/getItem are gated
// behind the `--localstorage-file` flag), so code that persists to it under the
// `browser` condition would throw. Install a minimal in-memory Storage so the
// browser persistence path is genuinely exercised instead of warning on write.
class MemoryStorage implements Storage {
	#store = new Map<string, string>();
	get length(): number {
		return this.#store.size;
	}
	clear(): void {
		this.#store.clear();
	}
	getItem(key: string): string | null {
		return this.#store.has(key) ? (this.#store.get(key) as string) : null;
	}
	key(index: number): string | null {
		return Array.from(this.#store.keys())[index] ?? null;
	}
	removeItem(key: string): void {
		this.#store.delete(key);
	}
	setItem(key: string, value: string): void {
		this.#store.set(key, String(value));
	}
}

Object.defineProperty(globalThis, 'localStorage', {
	value: new MemoryStorage(),
	configurable: true
});
