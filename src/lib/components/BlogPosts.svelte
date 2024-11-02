<script lang="ts">
	import {
		DirectusImageTransformation,
		PagePath,
		type BlogPostEntry,
		type BlogPostImage,
		type BlogPostItem,
		type BlogPostTranslation,
		type CalendarStore
	} from '$lib/models';
	import { debounce, getTranslation, imageUrlBuilder } from '$lib/utils';
	import { Input } from 'flowbite-svelte';
	import { onMount, tick } from 'svelte';
	import { locale } from 'svelte-i18n';
	// @ts-expect-error - Ignore this error
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import { t } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import { Datepicker } from './calendar';
	import dayjs from 'dayjs';

	export let posts: BlogPostEntry[];
	export let thumbnails: Map<string, BlogPostImage>;
	export let searchable = false;

	const observers: HTMLDivElement[] = [];
	let observer: IntersectionObserver;
	let searchTerm: string;
	let postItemsFiltered: BlogPostItem[] = [];
	let fromCalendarStore: CalendarStore;
	let toCalendarStore: CalendarStore;
	let fromDate: Date;
	let toDate: Date;
	let initStartDate: Date;
	let initEndDate: Date;
	let fromDatepickerStart: Date;
	let fromDatepickerEnd: Date;
	let toDatepickerStart: Date;
	let toDatepickerEnd: Date;

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
			date: postDate,
			formattedDate: {
				day: postDate.getDate(),
				month: postDate.toLocaleString('default', { month: 'long' })
			}
		} as BlogPostItem;
	});

	if (searchable) {
		initStartDate = normalizeDate(
			new Date(
				posts.reduce((earliest, current) => (current.date < earliest.date ? current : earliest)).date ?? new Date()
			)
		);
		initEndDate = normalizeDate(
			new Date(posts.reduce((latest, current) => (current.date > latest.date ? current : latest)).date ?? new Date())
		);

		fromDate = initStartDate;
		toDate = initEndDate;

		fromDatepickerStart = initStartDate;
		fromDatepickerEnd = toDate;
		toDatepickerStart = fromDate;
		toDatepickerEnd = initEndDate;
	}

	$: fromDatepickerEnd = toDate;
	$: toDatepickerStart = dayjs(fromDate).subtract(1, 'hour').toDate();

	const debouncedSearch = debounce(async () => {
		postItemsFiltered = filterBlogPosts(postItems, searchTerm, fromDate, toDate);
		await tick();
	}, 300);

	$: if (browser && searchTerm !== undefined) {
		debouncedSearch();
	}

	function normalizeDate(date: Date): Date {
		const newDate = new Date(date);
		newDate.setHours(0, 0, 0, 0);
		return newDate;
	}

	function filterBlogPosts(posts: BlogPostItem[], term: string, from: Date, to: Date) {
		const lowerCaseTerm = term?.toLowerCase();
		from.setHours(12);
		to.setHours(12);
		return posts.filter(
			(post) =>
				(lowerCaseTerm
					? getBlogPostTranslation(post.translations, $locale)?.title?.toLowerCase().includes(lowerCaseTerm)
					: true) &&
				post.date >= from &&
				post.date <= to
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
		if (searchable) {
			fromCalendarStore?.subscribe((data) => {
				if (data.hasChosen && !data.open && data.selected !== fromDate) {
					fromDate = data.selected;
					if (fromDate > toDate) {
						toDate = fromDate;
					}
					debouncedSearch();
				}
			});
			toCalendarStore?.subscribe((data) => {
				if (data.hasChosen && !data.open && data.selected !== toDate) {
					toDate = data.selected;
					if (toDate < fromDate) {
						fromDate = toDate;
					}
					debouncedSearch();
				}
			});
		}
	});
</script>

<div class="mx-auto max-w-screen-xl p-5 pt-0 dark:text-gray-100">
	{#if searchable}
		<div class="mb-5 flex-row items-center justify-between gap-2 md:flex">
			<div class="relative w-full md:w-72">
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
			<div class="mt-3 flex items-center justify-center gap-2 px-3">
				<div>{$t('common.from')}</div>
				<Datepicker
					bind:store={fromCalendarStore}
					selected={fromDate}
					bind:start={fromDatepickerStart}
					bind:end={fromDatepickerEnd}
				/>
				<div>{$t('common.to')}</div>
				<Datepicker
					bind:store={toCalendarStore}
					selected={toDate}
					bind:start={toDatepickerStart}
					bind:end={toDatepickerEnd}
				/>
			</div>
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
