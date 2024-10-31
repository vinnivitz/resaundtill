<script lang="ts">
	import {
		DirectusImageTransformation,
		PagePath,
		type BlogPostEntry,
		type BlogPostImage,
		type BlogPostItem,
		type BlogPostTranslation
	} from '$lib/models';
	import { debounce, getTranslation, imageUrlBuilder } from '$lib/utils';
	import { Input } from 'flowbite-svelte';
	import { onMount, tick } from 'svelte';
	import { locale } from 'svelte-i18n';
	// @ts-expect-error - Ignore this error
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import { t } from 'svelte-i18n';
	import { browser } from '$app/environment';

	export let posts: BlogPostEntry[];
	export let thumbnails: Map<string, BlogPostImage>;
	export let searchable = false;

	const observers: HTMLDivElement[] = [];
	let observer: IntersectionObserver;
	let searchTerm: string;
	let postItemsFiltered: BlogPostItem[] = [];

	$: postItems = postItemsFiltered = posts.map((post) => {
		const { id, date, translations } = post;
		const thumbnail = thumbnails.get(id);
		const imageUrl = thumbnail
			? imageUrlBuilder(thumbnail.directus_files_id.id, DirectusImageTransformation.PREVIEW)
			: '/images/gallery/travel.jpg';
		const postDate = new Date(date);
		return {
			id,
			translations,
			imageUrl,
			formattedDate: {
				day: postDate.getDate(),
				month: postDate.toLocaleString('default', { month: 'long' })
			}
		} as BlogPostItem;
	});

	const debouncedSearch = debounce(async () => {
		postItemsFiltered = filterBlogPostsBySearchTerm(postItems, searchTerm);
		await tick();
	}, 300);

	$: if (browser && searchTerm !== undefined) {
		debouncedSearch();
	}

	function filterBlogPostsBySearchTerm(posts: BlogPostItem[], term: string) {
		const lowerCaseTerm = term.toLowerCase();
		return posts.filter((post) =>
			getBlogPostTranslation(post.translations, $locale)?.title?.toLowerCase().includes(lowerCaseTerm)
		);
	}

	function lazyLoadBackground(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const element = entry.target as HTMLDivElement;
				if (element) {
					element.style.backgroundImage = `url(${element.dataset.bgUrl})`;
					observer.unobserve(element);
				}
			}
		});
	}

	function registerObserver(node: HTMLDivElement) {
		observers.push(node);
		observer?.observe(node);
		return {
			destroy() {
				observer.unobserve(node);
			}
		};
	}

	function getBlogPostTranslation(
		translations: BlogPostTranslation[],
		locale: string | null | undefined
	): BlogPostTranslation | undefined {
		return getTranslation<BlogPostTranslation>(translations, locale);
	}

	onMount(() => {
		observer = new IntersectionObserver(lazyLoadBackground, {
			root: null,
			rootMargin: '0px',
			threshold: 0.01
		});

		observers.forEach((obs) => observer.observe(obs));
	});
</script>

<div class="mx-auto max-w-screen-xl p-5 dark:text-gray-100">
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
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
		{#each postItemsFiltered as post}
			<a
				href={`${PagePath.travel}/${post.id}`}
				class="xl:transition xl:delay-150 xl:duration-300 xl:ease-in-out xl:hover:-translate-y-1 xl:hover:scale-110"
			>
				<div
					class="relative flex h-96 w-full items-end justify-start bg-cover bg-center text-left dark:bg-gray-500"
					data-bg-url={post.imageUrl}
					use:registerObserver
					style={`background-color: #6c7380;`}
				>
					<div
						class="absolute bottom-0 left-0 right-0 top-0 z-[-1] bg-gradient-to-b dark:from-gray-900 dark:via-transparent dark:to-gray-900"
					/>
					<div class="absolute left-0 right-0 top-0 mx-5 mt-3 flex items-center justify-between">
						<div class="flex flex-col justify-start text-center text-gray-700">
							<span class="text-shadow text-3xl font-semibold leading-none tracking-wide">
								{post.formattedDate.day}
							</span>
							<span class="text-shadow uppercase leading-none">
								{post.formattedDate.month}
							</span>
						</div>
					</div>
					<div class="w-full bg-gradient-to-t from-black to-transparent">
						<h2 class="p-5">
							<div class="text-md font-medium text-gray-300">
								{getBlogPostTranslation(post.translations, $locale)?.title}
							</div>
						</h2>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>

<style lang="postcss">
	.text-shadow {
		text-shadow:
			0 0 5px rgba(255, 255, 255, 0.5),
			0 0 10px rgba(255, 255, 255, 1);
	}
</style>
