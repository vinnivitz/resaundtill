import { onDestroy } from 'svelte';

/**
 * Run a callback on an interval
 * @param cb callback
 * @param timer interval timer
 */
export function onInterval(cb: () => void, timer: number): void {
	const interval = setInterval(cb, timer);

	onDestroy(() => clearInterval(interval));
}
