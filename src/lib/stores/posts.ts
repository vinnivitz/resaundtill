import type { BlogPostEntry } from '$lib/sdk/types';
import { writable, type Writable } from 'svelte/store';

const blogPostStore: Writable<BlogPostEntry[]> = writable([]);

export default blogPostStore;