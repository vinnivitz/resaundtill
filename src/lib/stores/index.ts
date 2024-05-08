import { writable } from 'svelte/store';

export const imageCache = writable<Map<string, HTMLImageElement>>(new Map());
