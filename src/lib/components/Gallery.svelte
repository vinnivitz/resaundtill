<script lang="ts">
	import PhotoSwipeGallery from 'svelte-photoswipe';
	import type { GalleryItem } from 'svelte-photoswipe';
	const images: GalleryItem[] = [];

	export let urls: string[];

	for (const url of urls) {
		images.push({
			src: url,
			width: 3000,
			height: 4000,
			alt: 'Photo',
			cropped: true,
			thumbnail: { src: url, width: 300, height: 400 }
		});
	}
</script>

<div class="p-5 xl:p-10">
    <PhotoSwipeGallery {images} styling="flex" />
</div>
