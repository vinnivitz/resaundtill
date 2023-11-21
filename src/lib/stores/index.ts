import type { ID } from '@directus/sdk';
import { writable } from 'svelte/store';

export const imageCache = writable<Map<ID, HTMLImageElement>>(new Map());
