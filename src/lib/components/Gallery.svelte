<script lang="ts">
	// @ts-ignore
	import { GalleryImage, LightboxGallery } from 'svelte-lightbox';
	import { Input, Spinner } from 'flowbite-svelte';
	import { debounce, formatDate, imageUrlBuilder } from '$lib/utils';
	import {
		DirectusImageTransformation,
		PagePath,
		type BlogPostEntry,
		type DirectusImage,
		type GalleryImageItem,
		type LightboxController
	} from '$lib/models';
	import { imageCache } from '$lib/stores';
	// @ts-ignore
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import { _, locale } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import { t } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import Masonry from 'svelte-bricks';

	export let images: DirectusImage[] = [];
	export let caching = true;
	export let searchable = false;
	export let showPostLink = false;
	export let randomizePercentage = 0;
	export let posts: BlogPostEntry[] = [];

	type GalleryArrowCharacter = '' | 'hide' | 'loop';

	interface GalleryArrowsConfig {
		color: string;
		character: GalleryArrowCharacter;
		enableKeyboardControl: boolean;
	}

	const dispatch = createEventDispatcher();
	let MasonryComponent: typeof Masonry;
	let intersectionObserver: IntersectionObserver;
	let searchTerm: string;
	let cachedImages = new Map<string, HTMLImageElement>();
	let programmaticController: LightboxController;
	let initImg: string;

	const debouncedSearch = debounce(async () => {
		dispatch('loading', true);
		galleryImagesFiltered = filterImagesBySearchTerm(galleryImages, searchTerm);
		await tick();
		setupObservers();
		dispatch('loading', false);
	}, 300);

	$: if (browser && searchTerm !== undefined) {
		debouncedSearch();
	}

	let galleryImages: GalleryImageItem[] = images.map((file) => ({
		id: file.id,
		src: imageUrlBuilder(file.id)!,
		thumb: imageUrlBuilder(file.id, DirectusImageTransformation.THUMBNAIL)!,
		title: file.title,
		description: file.description,
		width: file.width,
		height: file.height,
		date: file.uploaded_on,
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

	function openModal(idx: number) {
		if (caching) {
			cacheImages();
		}
		programmaticController.openImage(idx);
	}

	function renderFooter(image: GalleryImageItem) {
		const footer = document.querySelector('.svelte-lightbox-footer');
		if (footer) {
			footer.innerHTML = `
					<div class="mt-2 px-2 mx-auto flex flex-row items-start justify-between gap-4">
						<div>
							<div class="text-gray-100">
								${image.title}
							</div>
						</div>
						<div class="flex flex-row items-center gap-2">
							<div class="mt-1 text-sm text-nowrap">${formatDate(getPostDateByImageId(image.id, image.date), $locale)}</div>
						</div>
					</div>
					<div class="mt-3 px-2 text-sm text-gray-100">
						${image.description && image.description.length < 60 ? image.description : ''}
					</div>
				`;
		}
	}

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

	async function cacheImagesSequentially(cache: Map<string, HTMLImageElement>) {
		for (let i = 0; i < galleryImages.length; i++) {
			const img = await loadDetailImage(galleryImages[i]);
			if (!cache.has(galleryImages[i].id)) {
				cache.set(galleryImages[i].id, img);
				cachedImages.set(galleryImages[i].id, img);
			}
		}
	}

	async function loadDetailImage(imageItem: GalleryImageItem): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();

			img.onload = () => resolve(img);

			img.onerror = reject;

			img.src = imageItem.src;
		});
	}

	function handleIntersection(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const placeholder = entry.target as HTMLDivElement;
				const image = placeholder.firstElementChild as HTMLImageElement;
				image.onload = () => (placeholder.dataset.loaded = 'true');
				image.src = image.dataset.src!;
				intersectionObserver.unobserve(placeholder);
				observeNextImage();
			}
		});
	}

	function observeNextImage() {
		const placeholders = document.querySelectorAll('.placeholder:not([data-loaded])');
		if (placeholders.length > 0) {
			intersectionObserver.observe(placeholders[0]);
		}
	}

	function setupObservers() {
		if (intersectionObserver) {
			intersectionObserver.disconnect();
		}

		intersectionObserver = new IntersectionObserver(handleIntersection, {
			root: null,
			rootMargin: '0px',
			threshold: 0
		});

		const placeholders = document.querySelectorAll('.placeholder');
		placeholders.forEach((placeholder) => {
			intersectionObserver.observe(placeholder);
		});
		observeNextImage();
	}

	async function gotoPost(id: string) {
		const post = posts?.find((post) => post.images?.find((image) => image.directus_files_id.id === id));
		if (post) {
			await goto(`${PagePath.travel}/${post.id}`);
		}
	}

	function getPostDateByImageId(id: string, fallback: string) {
		const post = posts?.find((post) => post.images?.find((image) => image.directus_files_id.id === id));
		return new Date(post?.date || fallback);
	}

	function getPlaceholderImage(image: GalleryImageItem) {
		const canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		ctx.clearRect(0, 0, image.width, image.height);
		return canvas.toDataURL('image/webp');
	}

	function createInitImage() {
		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		ctx.clearRect(0, 0, 1, 1);
		return canvas.toDataURL('image/webp');
	}

	onMount(async () => {
		initImg = createInitImage();
		const masonryModule = await import('svelte-bricks');
		MasonryComponent = masonryModule.default;
		await tick();
		setupObservers();
		dispatch('loading', false);
	});
</script>

{#if searchable}
	<div class="relative mb-5 w-full md:w-72">
		<div class="pointer-events-none absolute inset-y-0 left-0 flex h-10 w-10 items-center pl-3">
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

{#if browser}
	<div class:has-post-link={showPostLink}>
		<LightboxGallery bind:programmaticController {arrowsConfig}>
			{#each galleryImagesFiltered as image}
				<GalleryImage>
					{#if showPostLink && (cachedImages.has(image.id) || image.loaded)}
						<div class="absolute left-0 top-0 mt-[-36px] flex justify-center pb-3">
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<div
								on:click={() => gotoPost(image.id)}
								class="cursor-pointer rounded-full bg-gray-200 px-2 py-1 text-gray-800 hover:bg-gray-400"
							>
								{$t('components.gallery.lightbox.post-button')}
							</div>
						</div>
					{/if}
					{#if cachedImages.has(image.id)}
						<img
							class="m-auto"
							src={cachedImages.get(image.id)?.src}
							alt={image.title}
							on:load={() => renderFooter(image)}
						/>
					{:else}
						{#if !image.loaded}
							<div class="absolute z-10 flex items-center justify-center" style="width: 100vw; height: 100vh;">
								<Spinner size="24" color="blue" />
							</div>
							<img class="m-auto" id={image.id} src={getPlaceholderImage(image)} alt={image.title} />
						{/if}
						<img
							src={image.src}
							alt={image.title}
							style:opacity={image.loaded ? '1' : '0'}
							class="m-auto transition-opacity duration-100"
							on:load={() => renderFooter(image)}
						/>
					{/if}
					{#if image.description && image.description.length >= 60}
						<div class="text-shadow absolute bottom-0 left-1 right-1 text-sm text-gray-100">{image.description}</div>
					{/if}
				</GalleryImage>
			{/each}
		</LightboxGallery>
	</div>
{/if}

{#if galleryImagesFiltered.length === 0}
	<div class="flex justify-center">
		<div>{$_('components.gallery.no_results')}</div>
	</div>
{/if}

{#if browser}
	<div class="hidden md:block">
		<svelte:component
			this={MasonryComponent}
			animate={false}
			items={galleryImagesFiltered}
			minColWidth={200}
			maxColWidth={800}
			gap={20}
			let:item
			let:idx
		>
			<div class="placeholder relative w-full bg-gray-500" style="padding-bottom: {(item.height / item.width) * 100}%;">
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<img
					class="absolute left-0 top-0 cursor-pointer transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 md:hover:scale-[1.05] lg:hover:scale-[1.02]"
					decoding="async"
					src={initImg}
					data-src={item.src}
					alt={item.title}
					width={item.width}
					height={item.height}
					on:click={() => openModal(idx)}
				/>
			</div>
		</svelte:component>
	</div>
	<div class="block md:hidden">
		<svelte:component
			this={MasonryComponent}
			animate={false}
			items={galleryImagesFiltered}
			minColWidth={150}
			maxColWidth={800}
			gap={10}
			let:item
			let:idx
		>
			<div class="placeholder relative w-full bg-gray-500" style="padding-bottom: {(item.height / item.width) * 100}%;">
				<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<img
					class="absolute left-0 top-0 cursor-pointer transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 md:hover:scale-[1.05] lg:hover:scale-[1.02]"
					decoding="async"
					src={initImg}
					data-src={item.src}
					alt={item.title}
					width={item.width}
					height={item.height}
					on:click={() => openModal(idx)}
				/>
			</div>
		</svelte:component>
	</div>
{/if}

<style lang="postcss">
	:global(.previous-button) {
		outline: none !important;
	}

	:global(.next-button) {
		display: flex;
		align-items: center;
		justify-content: end;
		outline: none !important;
	}

	:global(.has-post-link.next-button) {
		margin-top: 30px;
	}

	:global(.has-post-link.previous-button) {
		margin-top: 30px;
	}

	:global(.next-button svg) {
		filter: drop-shadow(-2px -1px 0px #000) drop-shadow(2px -1px 0px #000) drop-shadow(1px 1px 0px #000)
			drop-shadow(-1px 1px 0px #000);
	}

	:global(.previous-button svg) {
		filter: drop-shadow(-2px -1px 0px #000) drop-shadow(2px -1px 0px #000) drop-shadow(1px 1px 0px #000)
			drop-shadow(-1px 1px 0px #000);
	}

	.text-shadow {
		text-shadow:
			0 0 5px rgba(0, 0, 0, 0.5),
			0 0 10px rgb(0, 0, 0);
	}
</style>
