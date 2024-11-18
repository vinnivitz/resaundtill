<script lang="ts">
	import { Input, Progressbar, Spinner } from 'flowbite-svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import Masonry from 'svelte-bricks';
	import { t } from 'svelte-i18n';
	import { Icon } from 'svelte-icons-pack';
	import { BiSearch } from 'svelte-icons-pack/bi';
	import { ImCross } from 'svelte-icons-pack/im';
	import { RiArrowsArrowLeftSLine, RiArrowsArrowRightSLine } from 'svelte-icons-pack/ri';

	import { DirectusImageTransformation, PagePath, type ImageDetails, type GalleryImageItem } from '$lib/models';
	import { dateStore, galleryShufflePercentageStore, imageCacheStore } from '$lib/stores';
	import { clickOutside, debounce, imageUrlBuilder } from '$lib/utils';

	import { goto } from '$app/navigation';

	let {
		images,
		caching = true,
		searchable = false,
		showPostLinkOnDetail = false,
		showDateOnDetail = false,
		randomize = true,
		imageTransformation = DirectusImageTransformation.THUMBNAIL
	}: {
		images: ImageDetails[] | undefined;
		caching?: boolean;
		searchable?: boolean;
		showPostLinkOnDetail?: boolean;
		showDateOnDetail?: boolean;
		randomize?: boolean;
		imageTransformation?: DirectusImageTransformation;
	} = $props();

	let intersectionObserver: IntersectionObserver;
	let searchTerm = $state<string | undefined>();
	let cachedImages = $state(new Map<string, HTMLImageElement>());
	let placeholderImage = $state<string | undefined>();
	let imageItemsFiltered = $state<GalleryImageItem[] | undefined>();
	let filterTrigger = $state(0);
	let modalOpen = $state(false);
	let modalIndex = $state(0);
	let modalImage = $state<GalleryImageItem | undefined>();

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

	onMount(async () => {
		globalThis.addEventListener('keydown', modalKeyNavigation);
		placeholderImage = createInitImage();
		await tick();
		setupObservers();
	});

	onDestroy(() => {
		if (globalThis) {
			globalThis.removeEventListener('keydown', modalKeyNavigation);
			if (intersectionObserver) {
				intersectionObserver.disconnect();
			}
		}
	});

	$effect(() => debouncedFilter(imageItems, searchTerm, filterTrigger));

	function modalKeyNavigation(event: KeyboardEvent): void {
		switch (event.key) {
			case 'ArrowRight': {
				nextImage();

				break;
			}
			case 'ArrowLeft': {
				previousImage();

				break;
			}
			case 'Escape': {
				modalOpen = false;

				break;
			}
			// No default
		}
	}

	function openModal(index: number): void {
		if (!imageItemsFiltered) {
			return;
		}
		if (caching) {
			cacheImages(imageItemsFiltered);
		}
		modalIndex = index;
		modalImage = imageItemsFiltered[index];
		modalOpen = true;
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
			imageItemsFiltered = getFilteredImages(items, term);
			await tick();
			setupObservers();
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
		if (image.requested) {
			return;
		}
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', image.src, true);
			xhr.responseType = 'blob';
			xhr.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					image.requested = true;
					image.progress = Math.floor((event.loaded / event.total) * 100);
					if (imageItemsFiltered) {
						imageItemsFiltered = [...imageItemsFiltered];
					}
				}
			});

			xhr.addEventListener('load', async () => {
				if (xhr.status === 200) {
					const blob = xhr.response;
					image.src = URL.createObjectURL(blob);
					cachedImages.set(image.id, await loadDetailImage(image));
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

	function getPlaceholderImageAndInitLoading(image: GalleryImageItem): string {
		loadDetailImageWithProgress(image);
		return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${image.width}' height='${image.height}'><rect width='100%' height='100%' fill="transparent"/></svg>`;
	}

	function createInitImage(): string {
		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		const context = canvas.getContext('2d') as CanvasRenderingContext2D;
		context.clearRect(0, 0, 1, 1);
		return canvas.toDataURL('image/webp');
	}

	function nextImage(): void {
		if (modalIndex === imageItemsFiltered!.length - 1) {
			modalIndex = 0;
		} else {
			modalIndex++;
		}
		modalImage = imageItemsFiltered![modalIndex];
	}

	function previousImage(): void {
		if (modalIndex === 0) {
			modalIndex = imageItemsFiltered!.length - 1;
		} else {
			modalIndex--;
		}
		modalImage = imageItemsFiltered![modalIndex];
	}
</script>

{#if searchable}
	<div class="relative mb-5 w-full md:w-72">
		<div class="pointer-events-none absolute inset-y-0 left-0 flex h-10 w-10 items-center pl-3">
			<Icon src={BiSearch} size="18"></Icon>
		</div>
		<Input
			id="search-navbar"
			class="pl-14"
			placeholder={$t('components.gallery.searchbar.placeholder')}
			bind:value={searchTerm}
		/>
	</div>
{/if}

{#if modalOpen && modalImage}
	<div class="fixed bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-black bg-opacity-80">
		<button
			class="absolute right-5 top-5 z-20 flex cursor-pointer justify-end invert"
			onclick={() => (modalOpen = false)}
		>
			<Icon src={ImCross} size="38"></Icon>
		</button>
		<div class="relative" use:clickOutside oncanplay={() => (modalOpen = false)}>
			<button
				class="absolute left-0 top-0 z-20 flex h-full w-1/2 cursor-pointer items-center justify-start outline-none"
				tabindex="0"
				onclick={previousImage}
			>
				<Icon src={RiArrowsArrowLeftSLine} size="64" color="white"></Icon>
			</button>
			<button
				class="absolute right-0 top-0 z-20 flex h-full w-1/2 cursor-pointer items-center justify-end outline-none"
				tabindex="0"
				onclick={nextImage}
			>
				<Icon src={RiArrowsArrowRightSLine} size="64" color="white"></Icon>
			</button>
			{#if showPostLinkOnDetail}
				<div class="absolute -top-16 flex justify-between pl-3 pt-3 md:pl-0">
					<div
						role="button"
						tabindex="0"
						onclick={async () => await gotoPost(modalImage!.postId)}
						onkeydown={async (event) => event.key === 'Enter' && (await gotoPost(modalImage!.postId))}
						class="cursor-pointer rounded-full bg-gray-200 px-2 py-1 text-gray-800 hover:bg-gray-400"
					>
						{$t('components.gallery.lightbox.post-button')}
					</div>
				</div>
			{/if}
			{#if cachedImages.has(modalImage.id)}
				<img
					src={cachedImages.get(modalImage.id)!.src}
					width={modalImage.width}
					height={modalImage.height}
					alt={modalImage.title}
					class="block h-auto max-h-[85vh] w-auto max-w-full object-contain"
				/>
			{:else if !modalImage.loaded}
				<img
					src={getPlaceholderImageAndInitLoading(modalImage)}
					width={modalImage.width}
					height={modalImage.height}
					alt={modalImage.title}
					class="block h-auto max-h-[85vh] w-auto max-w-full object-contain"
				/>
				<div class="absolute bottom-0 left-0 right-0 top-0 flex w-full items-center justify-center">
					<Progressbar progress={modalImage.progress} color="green" size="lg" class="mx-16 w-full md:mx-48" labelInside
					></Progressbar>
				</div>
			{:else}
				<img
					src={modalImage.src}
					width={modalImage.width}
					height={modalImage.height}
					alt={modalImage.title}
					class="block h-auto max-h-[85vh] w-auto max-w-full object-contain"
				/>
			{/if}
			<div class="text-shadow -bottom-18 absolute left-0 w-full p-3 font-bold text-white">
				<div class="flex items-center justify-between">
					<div>{modalImage.title}</div>
					{#if showDateOnDetail}
						<div class="text-nowrap text-xs">{$dateStore(modalImage.date, 'DD. MMMM YYYY')}</div>
					{/if}
				</div>
				{#if modalImage.description && modalImage.description.length < 60}
					<div class="text-sm">{modalImage.description}</div>
				{/if}
			</div>
			{#if modalImage.description && modalImage.description.length >= 60}
				<div class="text-shadow absolute bottom-0 left-0 right-0 w-full p-3 text-sm font-bold text-white">
					{modalImage.description}
				</div>
			{/if}
		</div>
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
