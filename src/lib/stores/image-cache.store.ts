import { writable } from 'svelte/store';

export const imageCacheStore = writable<Map<string, HTMLImageElement>>(new Map());
