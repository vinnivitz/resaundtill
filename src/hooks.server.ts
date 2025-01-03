import type { Handle } from '@sveltejs/kit';
import { locale } from 'svelte-i18n';

export const handle: Handle = async ({ event, resolve }) => {
	process = process || {};
	const lang = event.request.headers.get('accept-language')?.split(',')[0];
	if (lang) {
		locale.set(lang);
	}
	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			const allowedHeaders = ['content-type'];
			return allowedHeaders.includes(name.toLowerCase());
		}
	});
};
