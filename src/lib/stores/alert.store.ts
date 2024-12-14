import { writable, type Readable } from 'svelte/store';

export function createAlertStore(): Readable<string | undefined> & { setAlert: (message: string) => void } {
	const { set, subscribe } = writable<string | undefined>();

	function setAlert(message: string): void {
		set(message);
		setTimeout(() => set(undefined), 5000);
	}

	return {
		subscribe,
		setAlert
	};
}

export const alertStore = createAlertStore();
