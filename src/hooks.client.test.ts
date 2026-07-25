import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

// No DSN — Sentry stays uninitialized, which is orthogonal to the preload guard.
vi.mock('$env/dynamic/public', () => ({ env: {} }));

// The real package is externalized by Vite and pulls in `$app/*` specifiers that
// only exist inside a SvelteKit build. Nothing here exercises Sentry itself.
vi.mock('@sentry/sveltekit', () => ({
	init: vi.fn(),
	handleErrorWithSentry: () => vi.fn()
}));

const PRELOAD_RELOAD_KEY = 'sk:preload-reloaded-at';

/** jsdom's own `sessionStorage` is a non-functional stub, so install a real one. */
function memoryStorage() {
	const store = new Map<string, string>();
	return {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => void store.set(key, String(value)),
		removeItem: (key: string) => void store.delete(key),
		clear: () => store.clear(),
		key: (i: number) => Array.from(store.keys())[i] ?? null,
		get length() {
			return store.size;
		}
	} as Storage;
}

/** Handlers each fresh import registered on jsdom's persistent `window`. */
const registered: Array<(event: Event) => void> = [];

/**
 * Load a *fresh* copy of the module, so each test gets a fresh page's worth of
 * module state (the in-flight `reloading` latch).
 */
async function loadHooks() {
	vi.resetModules();
	const mod = await import('./hooks.client');
	registered.push(mod.handlePreloadError);
	return mod;
}

const preloadError = () => new Event('vite:preloadError', { cancelable: true });

let reload: ReturnType<typeof vi.fn>;
let storage: Storage;

beforeEach(() => {
	reload = vi.fn();
	storage = memoryStorage();
	vi.stubGlobal('sessionStorage', storage);
	vi.stubGlobal('location', { href: 'https://missymidwest.com/shop', reload });
});

afterEach(() => {
	// jsdom's `window` outlives `vi.resetModules()`, so every re-import stacks
	// another live listener. Unregister them or a later dispatch-based test would
	// fire N stale handlers, each with its own `reloading` latch.
	for (const handler of registered) window.removeEventListener('vite:preloadError', handler);
	registered.length = 0;
	vi.unstubAllGlobals();
});

describe('vite:preloadError recovery', () => {
	it('registers itself on the window', async () => {
		const addEventListener = vi.spyOn(window, 'addEventListener');
		const { handlePreloadError } = await loadHooks();

		expect(addEventListener).toHaveBeenCalledWith('vite:preloadError', handlePreloadError);
		addEventListener.mockRestore();
	});

	it('swallows the error and reloads into fresh chunks', async () => {
		const { handlePreloadError } = await loadHooks();
		const event = preloadError();

		handlePreloadError(event);

		expect(event.defaultPrevented).toBe(true);
		expect(reload).toHaveBeenCalledOnce();
		expect(storage.getItem(PRELOAD_RELOAD_KEY)).not.toBeNull();
	});

	it('swallows the follow-on cascade while the reload is in flight', async () => {
		const { handlePreloadError } = await loadHooks();
		handlePreloadError(preloadError());

		// SvelteKit falls back to its error page, whose nodes are stale too.
		const cascade = preloadError();
		handlePreloadError(cascade);

		expect(cascade.defaultPrevented).toBe(true);
		expect(reload).toHaveBeenCalledOnce();
	});

	it('lets the error through when a recent reload did not fix it', async () => {
		storage.setItem(PRELOAD_RELOAD_KEY, String(Date.now() - 1_000));
		const { handlePreloadError } = await loadHooks();
		const event = preloadError();

		handlePreloadError(event);

		expect(event.defaultPrevented).toBe(false);
		expect(reload).not.toHaveBeenCalled();
	});

	it('reloads again once the cooldown has elapsed', async () => {
		storage.setItem(PRELOAD_RELOAD_KEY, String(Date.now() - 20_000));
		const { handlePreloadError } = await loadHooks();
		const event = preloadError();

		handlePreloadError(event);

		expect(event.defaultPrevented).toBe(true);
		expect(reload).toHaveBeenCalledOnce();
	});

	it('lets the error through when storage is blocked', async () => {
		vi.stubGlobal('sessionStorage', {
			...storage,
			getItem: () => {
				throw new Error('SecurityError');
			}
		});
		const { handlePreloadError } = await loadHooks();
		const event = preloadError();

		handlePreloadError(event);

		expect(event.defaultPrevented).toBe(false);
		expect(reload).not.toHaveBeenCalled();
	});
});
