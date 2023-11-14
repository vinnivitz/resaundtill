<script lang="ts">
	import type { DirectusImage } from '$lib/sdk/types';
	import Masonry from 'svelte-bricks';
	import { GalleryImage, LightboxGallery } from 'svelte-lightbox';
	import type { GalleryImageItem } from '$lib/models/gallery-image-item.model';
	import type { LightboxController } from '$lib/models/lightbox-controller.model';
	import type { GalleryArrowsConfig } from 'svelte-lightbox/dist/Types';
	import { Spinner } from 'flowbite-svelte';
	import { imageUrlBuilder } from '$lib/utils';
	import { DirectusImageTransformation } from '$lib/models/directus-images-transformation.enum';

	export let files: DirectusImage[];

	const images: GalleryImageItem[] = files.map((file, id) => ({
		id,
		src: imageUrlBuilder(file.id)!,
		thumb: imageUrlBuilder(file.id, DirectusImageTransformation.THUMBNAIL)!,
		title: file.title,
		description: file.description,
		width: file.width,
		height: file.height,
		loaded: false
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
		<GalleryImage>
			{#if !image.loaded}
				<div
					class="flex justify-center items-center h-screen"
					style:width={`${image.width}px`}
					style:height={`${image.height}px`}
				>
					<div>
						<Spinner size="24" />
					</div>
				</div>
			{/if}
			<img
				src={image.src}
				alt={image.title}
				style:display={image.loaded ? 'block' : 'none'}
				on:load={() => (image.loaded = true)}
			/>
			{#if image.title}
				<div class="text-gray-100">{image.title}</div>
			{/if}
			{#if image.description}
				<div class="text-sm text-gray-100">{image.description}</div>
			{/if}
		</GalleryImage>
	{/each}
</LightboxGallery>

<Masonry animate={true} items={images} minColWidth={200} maxColWidth={800} gap={20} let:item let:idx>
	<img
		class="cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 md:hover:scale-[1.05] lg:hover:scale-[1.02] duration-300"
		src={item.thumb}
		alt={item.title}
		on:click={openModal(idx)}
		on:keydown={() => null}
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

	:global(.svelte-lightbox-footer p) {
		display: none;
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
