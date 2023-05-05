<script lang="ts">
	import type { DirectusImage } from '$lib/sdk/types';
	import Masonry from 'svelte-bricks';
	import { imageUrlBuilder } from '$lib/utils/image-url-builderutils';
	import { GalleryImage, LightboxGallery } from 'svelte-lightbox';
	import type { GalleryImageItem } from '$lib/models/gallery-image-item.model';
	import type { LightboxController } from '$lib/models/lightbox-controller.model';
	import type { GalleryArrowsConfig } from 'svelte-lightbox/dist/Types';

	export let files: DirectusImage[];

	const images: GalleryImageItem[] = files.map((file, id) => ({
		id,
		src: imageUrlBuilder(file.id),
		title: file.title,
		description: file.description
	}));

	let programmaticController: LightboxController;

	const arrowsConfig: GalleryArrowsConfig = {
		character: 'loop',
		color: '#fff',
		enableKeyboardControl: true
	};

	const openModal = (idx: number): null => {
		programmaticController.openImage(idx);
		return null;
	};
</script>

<LightboxGallery bind:programmaticController {arrowsConfig}>
	{#each images as image}
		<GalleryImage title={image.title} description={image.description}>
			<img src={image.src} alt={image.title} />
		</GalleryImage>
	{/each}
</LightboxGallery>

<Masonry animate={true} items={images} minColWidth={200} maxColWidth={800} gap={20} let:item let:idx>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<img
		class="cursor-pointer xl:transition xl:ease-in-out xl:delay-150 xl:hover:-translate-y-1 xl:hover:scale-110 xl:duration-300"
		src={item.src}
		alt={item.title}
		on:click={openModal(idx)}
	/>
</Masonry>

<style lang="postcss">
	:global(.previous-button) {
		outline: none !important;
	}
	:global(.next-button) {
		left: 90% !important;
		outline: none !important;
	}

	@media only screen and (max-width: 726px) {
		:global(.next-button) {
			left: 80% !important;
		}
	}

	:global(.next-button svg) {
		filter: drop-shadow(-2px -1px 0px #000) drop-shadow(2px -1px 0px #000) drop-shadow(1px 1px 0px #000)
			drop-shadow(-1px 1px 0px #000);
	}

	:global(.previous-button svg) {
		filter: drop-shadow(-2px -1px 0px #000) drop-shadow(2px -1px 0px #000) drop-shadow(1px 1px 0px #000)
			drop-shadow(-1px 1px 0px #000);
	}
</style>
