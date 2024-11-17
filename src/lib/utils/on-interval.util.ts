import { onDestroy } from 'svelte';

/**
 * Run a callback on an interval
 * @param callback callback
 * @param timer interval timer
 */
export function onInterval(callback: () => void, timer: number): void {
	const interval = setInterval(callback, timer);

	onDestroy(() => clearInterval(interval));
}
