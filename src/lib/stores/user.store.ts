import { browser } from '$app/environment';
import { LayoutTheme, Locale, type UserPrefs } from '$lib/models/user.model';
import { writable } from 'svelte/store';

export const userStore = writable<UserPrefs>({
	theme: LayoutTheme.light,
	locale: browser ? (window.navigator.language as Locale) : Locale.de
});
