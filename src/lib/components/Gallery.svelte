<script lang="ts">
	import { Input, Progressbar, Spinner } from 'flowbite-svelte';
	import { onMount, tick } from 'svelte';
	import Masonry from 'svelte-bricks';
	import { t } from 'svelte-i18n';
	// @ts-expect-error - Types are missing
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import { GalleryImage, LightboxGallery } from 'svelte-lightbox';

	import {
		DirectusImageTransformation,
		PagePath,
		type ImageDetails,
		type GalleryImageItem,
		type LightboxController
	} from '$lib/models';
	import { dateStore, galleryShufflePercentageStore, imageCacheStore } from '$lib/stores';
	import { debounce, imageUrlBuilder } from '$lib/utils';

	import { goto } from '$app/navigation';

	let {
		images,
		caching = true,
		searchable = false,
		showPostLinkOnDetail = false,
		showDateOnDetail = true,
		randomize = true,
		imageTransformation = DirectusImageTransformation.THUMBNAIL,
		loaded
	}: {
		images: ImageDetails[] | undefined;
		caching?: boolean;
		searchable?: boolean;
		showPostLinkOnDetail?: boolean;
		showDateOnDetail?: boolean;
		randomize?: boolean;
		imageTransformation?: DirectusImageTransformation;
		loaded?: (value: boolean) => void;
	} = $props();

	type GalleryArrowCharacter = '' | 'hide' | 'loop';

	interface GalleryArrowsConfig {
		color: string;
		character: GalleryArrowCharacter;
		enableKeyboardControl: boolean;
	}

	const arrowsConfig: GalleryArrowsConfig = {
		character: 'loop',
		color: '#fff',
		enableKeyboardControl: true
	};

	let intersectionObserver: IntersectionObserver;
	let searchTerm = $state<string | undefined>();
	let cachedImages = $state(new Map<string, HTMLImageElement>());
	let programmaticController = $state<LightboxController>();
	let placeholderImage = $state<string | undefined>();
	let imageItemsFiltered = $state<GalleryImageItem[] | undefined>();
	let filterTrigger = $state(0);

	const imageItems = $derived<GalleryImageItem[] | undefined>(
		images && (!randomize || $galleryShufflePercentageStore)
			? partialShuffleImageOrder(
					images.map((image) => ({
						id: image.id,
						src: imageUrlBuilder(image.id),
						thumb: imageUrlBuilder(image.id, imageTransformation),
						title: image.title,
						description: image.description,
						date: image.uploaded_on,
						width: image.width,
						height: image.height,
						postId: image.postId,
						progress: 0,
						requested: false,
						loaded: false
					})),
					$galleryShufflePercentageStore
				)
			: undefined
	);

	$effect(() => debouncedFilter(imageItems, searchTerm, filterTrigger));

	function openModal(index: number): void {
		if (!imageItemsFiltered) {
			return;
		}
		if (caching) {
			cacheImages(imageItemsFiltered);
		}
		if (programmaticController) {
			programmaticController.openImage(index);
		}
	}

	function renderFooter(image: GalleryImageItem): void {
		const footer = document.querySelector('.svelte-lightbox-footer');
		if (footer) {
			footer.innerHTML = `
					<div class="mt-2 px-2 mx-auto flex flex-row items-start justify-between gap-4">
						<div>
							<div class="text-gray-100">
								${image.title}
							</div>
						</div>
						${
							showDateOnDetail
								? `
							<div class="flex flex-row items-center gap-2">
								<div class="mt-1 text-sm text-nowrap">${$dateStore(image.date, 'DD. MMMM YYYY')}</div>
							</div>
						`
								: ''
						}
					</div>
					<div class="mt-3 px-2 text-sm text-gray-100">
						${image.description && image.description.length < 60 ? image.description : ''}
					</div>
				`;
		}
	}

	function partialShuffleImageOrder(images: GalleryImageItem[], percentage = 0): GalleryImageItem[] {
		if (percentage <= 0 || percentage >= 100 || images.length === 0) {
			return images;
		}
		percentage = 0;
		const totalElements = images.length;
		const elementsToShuffle = Math.floor(totalElements * (percentage / 100));
		let selectedIndices = new Set<number>();

		while (selectedIndices.size < elementsToShuffle) {
			selectedIndices.add(globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % totalElements);
		}

		const shuffledArray = [...images];
		const indices = [...selectedIndices];
		for (let index = indices.length - 1; index > 0; index--) {
			const randomIndex = globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % (index + 1);
			[shuffledArray[indices[index]], shuffledArray[indices[randomIndex]]] = [
				shuffledArray[indices[randomIndex]],
				shuffledArray[indices[index]]
			];
		}

		return shuffledArray;
	}

	function debouncedFilter(items: GalleryImageItem[] | undefined, term: string | undefined, _: number): void {
		debounce(async () => {
			loaded?.(false);
			imageItemsFiltered = getFilteredImages(items, term);
			await tick();
			setupObservers();
			loaded?.(true);
		}, 300)();
	}

	function getFilteredImages(
		images: GalleryImageItem[] | undefined,
		term: string | undefined
	): GalleryImageItem[] | undefined {
		return images?.filter((image) => {
			const matchesTerm = term
				? image &&
					(image.title?.toLowerCase().includes(term.toLowerCase()) ||
						image.description?.toLowerCase().includes(term.toLowerCase()))
				: true;
			return matchesTerm;
		});
	}

	function cacheImages(images: GalleryImageItem[]): void {
		imageCacheStore.update((cache) => {
			cachedImages = cache;
			cacheImagesSequentially(images, cache);
			return cache;
		});
	}

	async function cacheImagesSequentially(
		images: GalleryImageItem[],
		cache: Map<string, HTMLImageElement>
	): Promise<void> {
		for (const image of images) {
			const img = await loadDetailImage(image);
			if (!cache.has(image.id)) {
				cache.set(image.id, img);
				cachedImages.set(image.id, img);
			}
		}
	}

	async function loadDetailImage(imageItem: GalleryImageItem): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.addEventListener('load', () => resolve(img));
			img.addEventListener('error', () => reject);
			img.src = imageItem.src;
		});
	}

	async function loadDetailImageWithProgress(image: GalleryImageItem): Promise<void> {
		return new Promise((resolve, reject) => {
			image.progress = 0;
			const xhr = new XMLHttpRequest();
			xhr.open('GET', image.src, true);
			xhr.responseType = 'blob';

			xhr.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					image.progress = Math.floor((event.loaded / event.total) * 100);
					if (imageItemsFiltered) {
						imageItemsFiltered = [...imageItemsFiltered];
					}
				}
			});

			xhr.addEventListener('load', () => {
				if (xhr.status === 200) {
					const blob = xhr.response;
					image.src = URL.createObjectURL(blob);
					image.loaded = true;
					resolve();
				} else {
					reject(new Error(`Failed to load image: ${xhr.statusText}`));
				}
			});

			xhr.addEventListener('error', () => reject(new Error('Network error')));

			xhr.send();
		});
	}

	function handleIntersection(entries: IntersectionObserverEntry[]): void {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				const placeholder = entry.target as HTMLDivElement;
				const image = placeholder.firstElementChild as HTMLImageElement;
				image.addEventListener('load', () => (placeholder.dataset.loaded = 'true'));
				image.src = image.dataset.src!;
				intersectionObserver.unobserve(placeholder);
				observeNextImage();
			}
		}
	}

	function observeNextImage(): void {
		const placeholders = document.querySelectorAll('.placeholder:not([data-loaded])');
		if (placeholders.length > 0) {
			intersectionObserver.observe(placeholders[0]);
		}
	}

	function setupObservers(): void {
		if (intersectionObserver) {
			intersectionObserver.disconnect();
		}

		intersectionObserver = new IntersectionObserver(handleIntersection, {
			root: undefined,
			rootMargin: '0px',
			threshold: 0
		});

		const placeholders = document.querySelectorAll('.placeholder');
		for (const placeholder of placeholders) {
			intersectionObserver.observe(placeholder);
		}
		observeNextImage();
	}

	async function gotoPost(id: string): Promise<void> {
		return goto(`${PagePath.travel}/${id}`);
	}

	function getPlaceholderImage(image: GalleryImageItem): string {
		loadDetailImageWithProgress(image);
		const canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		const context = canvas.getContext('2d') as CanvasRenderingContext2D;
		context.clearRect(0, 0, image.width, image.height);
		return canvas.toDataURL('image/webp');
	}

	function createInitImage(): string {
		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		const context = canvas.getContext('2d') as CanvasRenderingContext2D;
		context.clearRect(0, 0, 1, 1);
		return canvas.toDataURL('image/webp');
	}

	onMount(async () => {
		placeholderImage = createInitImage();
		await tick();
		setupObservers();
		loaded?.(true);
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
			placeholder={$t('components.gallery.searchbar.placeholder')}
			bind:value={searchTerm}
		/>
	</div>
{/if}

{#if imageItemsFiltered}
	<div class:has-post-link={showPostLinkOnDetail}>
		<LightboxGallery bind:programmaticController {arrowsConfig}>
			{#each imageItemsFiltered as image}
				<GalleryImage title={image.title}>
					{#if showPostLinkOnDetail && (cachedImages.has(image.id) || image.loaded)}
						<div class="absolute left-0 top-0 mt-[-36px] flex justify-center pb-3">
							<div
								role="button"
								tabindex="0"
								onclick={async () => await gotoPost(image.postId)}
								onkeydown={async (event_) => event_.key === 'Enter' && (await gotoPost(image.postId))}
								class="cursor-pointer rounded-full bg-gray-200 px-2 py-1 text-gray-800 hover:bg-gray-400"
							>
								{$t('components.gallery.lightbox.post-button')}
							</div>
						</div>
					{/if}
					{#if cachedImages.has(image.id)}
						<img
							decoding="async"
							class="m-auto"
							src={cachedImages.get(image.id)!.src}
							alt={image.title}
							onload={() => renderFooter(image)}
						/>
					{:else if !image.loaded}
						<div class="absolute z-10 flex items-center justify-center" style="width: 100vw; height: 100vh;">
							<Progressbar progress={image.progress} color="green" class="w-80" size="lg" labelInside></Progressbar>
						</div>
						<img class="m-auto" id={image.id} src={getPlaceholderImage(image)} alt={image.title} />
					{:else}
						<img
							decoding="async"
							src={image.src}
							alt={image.title}
							style:opacity={image.loaded ? '1' : '0'}
							class="m-auto transition-opacity duration-100"
							onload={() => renderFooter(image)}
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

{#if !imageItemsFiltered}
	<div class="flex h-screen items-center justify-center">
		<Spinner size="24" color="blue" />
	</div>
{/if}
{#if imageItemsFiltered && imageItemsFiltered.length === 0}
	<div class="flex justify-center">
		<div>{$t('components.gallery.no_results')}</div>
	</div>
{:else if imageItemsFiltered}
	<div class="hidden md:block">
		<Masonry
			animate={false}
			items={imageItemsFiltered}
			minColWidth={200}
			maxColWidth={800}
			gap={20}
			let:item
			let:idx={index}
		>
			<div class="placeholder relative w-full bg-gray-500" style="padding-bottom: {(item.height / item.width) * 100}%;">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<img
					class="absolute left-0 top-0 cursor-pointer transition delay-150 duration-300 ease-in-out hover:scale-110 md:hover:scale-[1.05] lg:hover:scale-[1.02]"
					decoding="async"
					src={placeholderImage}
					data-src={item.thumb}
					alt={item.title}
					width={item.width}
					height={item.height}
					onclick={() => openModal(index)}
				/>
			</div>
		</Masonry>
	</div>
	<div class="block md:hidden">
		<Masonry
			animate={false}
			items={imageItemsFiltered}
			minColWidth={150}
			maxColWidth={800}
			gap={10}
			let:item
			let:idx={index}
		>
			<div class="placeholder relative w-full bg-gray-500" style="padding-bottom: {(item.height / item.width) * 100}%;">
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<img
					class="absolute left-0 top-0 cursor-pointer transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 md:hover:scale-[1.05] lg:hover:scale-[1.02]"
					decoding="async"
					src={placeholderImage}
					data-src={item.thumb}
					alt={item.title}
					width={item.width}
					height={item.height}
					onclick={() => openModal(index)}
				/>
			</div>
		</Masonry>
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
