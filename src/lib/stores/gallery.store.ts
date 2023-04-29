import type { GalleryItem } from 'svelte-photoswipe';
import { writable } from 'svelte/store';

export const galleryStore = writable<GalleryItem[]>([]);
