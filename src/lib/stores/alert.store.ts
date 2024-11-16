import { writable, type Readable } from 'svelte/store';

export function createAlertStore(): Readable<string | undefined> & { setAlert: (message: string) => void } {
	const { set, subscribe } = writable<string | undefined>(undefined);

	function setAlert(message: string): void {
		set(message);

		setTimeout(() => {
			set(undefined);
		}, 5000);
	}

	return {
		subscribe,
		setAlert
	};
}

// Export a single instance of the alert store
export const alertStore = createAlertStore();
