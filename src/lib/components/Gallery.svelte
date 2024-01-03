<script lang="ts">
	import type { DirectusImage } from '$lib/sdk/types';
	import Masonry from 'svelte-bricks';
	// @ts-ignore
	import { GalleryImage, LightboxGallery } from 'svelte-lightbox';
	import type { GalleryArrowsConfig } from 'svelte-lightbox/dist/Types';
	import { Input, Spinner } from 'flowbite-svelte';
	import { imageUrlBuilder } from '$lib/utils';
	import { DirectusImageTransformation, type GalleryImageItem, type LightboxController } from '$lib/models';
	import { imageCache } from '$lib/stores';
	import type { ID } from '@directus/sdk';
	// @ts-ignore
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import { _ } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let images: DirectusImage[] = [];
	export let caching = true;
	export let searchable = false;
	export let randomizePercentage = 0;

	let searchTerm = '';
	let cachedImages = new Map<ID, HTMLImageElement>();
	let programmaticController: LightboxController;

	let galleryImages: GalleryImageItem[] = images.map((file) => ({
		id: file.id,
		src: imageUrlBuilder(file.id)!,
		thumb: imageUrlBuilder(file.id, DirectusImageTransformation.THUMBNAIL)!,
		title: file.title,
		description: file.description,
		width: file.width,
		height: file.height,
		loaded: false
	}));

	if (randomizePercentage > 0) {
		galleryImages = partialShuffleImageOrder(randomizePercentage);
	}

	let galleryImagesFiltered = galleryImages;

	const arrowsConfig: GalleryArrowsConfig = {
		character: 'loop',
		color: '#fff',
		enableKeyboardControl: true
	};

	const openModal = (idx: number): null => {
		if (caching) {
			cacheImages();
		}
		programmaticController.openImage(idx);
		return null;
	};

	$: galleryImagesFiltered = searchTerm ? filterImagesBySearchTerm(galleryImages, searchTerm) : galleryImages;

	function partialShuffleImageOrder(percentage: number): GalleryImageItem[] {
		const totalElements = galleryImages.length;
		const elementsToShuffle = Math.round(totalElements * (percentage / 100));
		let selectedIndices = new Set<number>();

		while (selectedIndices.size < elementsToShuffle) {
			const randomIndex = Math.floor(Math.random() * totalElements);
			selectedIndices.add(randomIndex);
		}

		let elements = Array.from(selectedIndices).map((index) => galleryImages[index]);

		for (let i = elements.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[elements[i], elements[j]] = [elements[j], elements[i]];
		}

		const shuffledArray = [...galleryImages];
		let shuffledIndex = 0;
		selectedIndices.forEach((index) => {
			shuffledArray[index] = elements[shuffledIndex++];
		});

		return shuffledArray;
	}

	function filterImagesBySearchTerm(images: GalleryImageItem[], term: string) {
		const lowerCaseTerm = term.toLowerCase();
		return images.filter(
			(image) =>
				image.title?.toLowerCase().includes(lowerCaseTerm) || image.description?.toLowerCase().includes(lowerCaseTerm)
		);
	}

	function cacheImages() {
		imageCache.update((cache) => {
			cachedImages = cache;
			cacheImagesSequentially(cache);
			return cache;
		});
	}

	async function cacheImagesSequentially(cache: Map<ID, HTMLImageElement>) {
		for (let i = 0; i < galleryImages.length; i++) {
			const img = await loadImage(galleryImages[i]);
			if (!cache.has(galleryImages[i].id)) {
				cache.set(galleryImages[i].id, img);
				cachedImages.set(galleryImages[i].id, img);
			}
		}
	}

	async function loadImage(imageItem: GalleryImageItem): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();

			img.onload = () => resolve(img);

			img.onerror = reject;

			img.src = imageItem.src;
		});
	}
</script>

{#if searchable}
	<div class="relative w-full md:w-72 mb-5">
		<div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none h-10 w-10">
			<FaSearch />
		</div>
		<Input
			id="search-navbar"
			class="pl-14"
			placeholder={$_('components.gallery.searchbar.placeholder')}
			bind:value={searchTerm}
		/>
	</div>
{/if}

<LightboxGallery bind:programmaticController {arrowsConfig}>
	{#each galleryImagesFiltered as image}
		<GalleryImage>
			{#if cachedImages.has(image.id)}
				<img
					class="m-auto"
					src={cachedImages.get(image.id)?.src}
					width={`${image.width}px`}
					height={`${image.height}px`}
					alt={image.title}
				/>
			{:else}
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
					width={`${image.width}px`}
					height={`${image.height}px`}
					style:opacity={image.loaded ? '1' : '0'}
					class="m-auto transition-opacity duration-100"
					on:load={() => (image.loaded = true)}
				/>
			{/if}

			{#if image.title}
				<div class="text-gray-100 m-1">{image.title}</div>
			{/if}
			{#if image.description}
				<div class="text-sm text-gray-100 m-1">{image.description}</div>
			{/if}
		</GalleryImage>
	{/each}
</LightboxGallery>

{#if galleryImagesFiltered.length === 0}
	<div class="flex justify-center">
		<div>{$_('components.gallery.no_results')}</div>
	</div>
{/if}

{#if browser}
	<div class="hidden md:block">
		<Masonry animate={true} items={galleryImagesFiltered} minColWidth={200} maxColWidth={800} gap={20} let:item let:idx>
			<img
				class="cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 md:hover:scale-[1.05] lg:hover:scale-[1.02] duration-300"
				src={item.thumb}
				alt={item.title}
				on:click={openModal(idx)}
				on:keydown={() => null}
			/>
		</Masonry>
	</div>
	<div class="block md:hidden">
		<Masonry animate={true} items={galleryImagesFiltered} minColWidth={150} maxColWidth={800} gap={10} let:item let:idx>
			<img
				class="cursor-pointer transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 md:hover:scale-[1.05] lg:hover:scale-[1.02] duration-300"
				src={item.thumb}
				alt={item.title}
				on:click={openModal(idx)}
				on:keydown={() => null}
			/>
		</Masonry>
	</div>
{:else}
	<div class="flex justify-center">
		<Spinner size="24" />
	</div>
{/if}

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
	:global(.) ;
</style>
