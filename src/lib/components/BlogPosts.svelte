<script lang="ts">
	import dayjs from 'dayjs';
	import { Input, Spinner, Button, Dropdown, Checkbox, Search } from 'flowbite-svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { Unsubscriber } from 'svelte/store';
	import { t, locale } from 'svelte-i18n';
	// @ts-expect-error - Typings are missing
	import FaArrowDown from 'svelte-icons/fa/FaArrowDown.svelte';
	// @ts-expect-error - Typings are missing
	import FaArrowUp from 'svelte-icons/fa/FaArrowUp.svelte';
	// @ts-expect-error - Typings are missing
	import FaChevronDown from 'svelte-icons/fa/FaChevronDown.svelte';
	// @ts-expect-error - Typings are missing
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	// @ts-expect-error - Typings are missing
	import FaTrashAlt from 'svelte-icons/fa/FaTrashAlt.svelte';

	import {
		BlogPostSort,
		DirectusImageTransformation,
		PagePath,
		type BlogPostCountrySearchItem,
		type BlogPostEntry,
		type BlogPostItem,
		type BlogPostTranslation,
		type CalendarModel,
		type CountryEntryTranslation
	} from '$lib/models';
	import { countriesStore, countryToPostsStore, postToImagesStore } from '$lib/stores/data.store';
	import { debounce, getTranslation, imageUrlBuilder } from '$lib/utils';

	import { Datepicker } from 'flowbite-svelte';

	let {
		posts,
		searchable = false,
		sort = BlogPostSort.DESCENDING
	}: { posts: BlogPostEntry[] | null; searchable?: boolean; sort?: BlogPostSort } = $props();

	let observer: IntersectionObserver;
	const observers: HTMLDivElement[] = [];

	let searchTerm: string | undefined = $state(undefined);
	let countrySearchTerm: string | undefined = $state(undefined);
	let resetted = $state(false);
	let filterTrigger = $state(0);
	let initCalendar = $state<CalendarModel>({});

	let postsItemsFiltered = $state<BlogPostItem[] | undefined>(undefined);
	let countrySearchItemsFiltered = $state<BlogPostCountrySearchItem[] | undefined>(undefined);

	const postItems: BlogPostItem[] | undefined = $derived(
		posts && $postToImagesStore
			? posts.map((post) => {
					const thumbnailUrl = $postToImagesStore.get(post.id)?.[0];
					return {
						id: post.id,
						date: new Date(post.date),
						formattedDate: {
							day: dayjs(new Date(post.date)).format('D'),
							month: dayjs(new Date(post.date)).format('MMMM')
						},
						translations: post.translations,
						thumbnailUrl: thumbnailUrl
							? imageUrlBuilder(thumbnailUrl, DirectusImageTransformation.PREVIEW)
							: 'images/gallery/travel.jpg'
					};
				})
			: undefined
	);

	const countrySearchItems: BlogPostCountrySearchItem[] | undefined = $derived(
		postItems && $countriesStore && $countryToPostsStore
			? [
					...$countriesStore.map((country) => ({
						name: getTranslation<CountryEntryTranslation>(country.translations, $locale)?.name ?? '',
						checked: true,
						visible: true,
						code: country.code,
						postIds: $countryToPostsStore.get(country.code) ?? []
					})),
					{
						name: $t('components.posts.country-filter-not-categorized'),
						checked: true,
						visible: true,
						code: '',
						postIds: postItems
							.filter((post) => {
								const categorizedPostIds = new Set(
									$countriesStore.flatMap((country) => $countryToPostsStore.get(country.code) ?? [])
								);
								return !categorizedPostIds.has(post.id);
							})
							.map((post) => post.id)
					}
				]
			: undefined
	);

	$effect(() => {
		countrySearchItemsFiltered = countrySearchItems;
	});

	$effect(() => {
		countrySearchItemsFiltered = countrySearchTerm
			? countrySearchItems?.map((country) => ({
					...country,
					visible: country.name.toLowerCase().indexOf(countrySearchTerm!.toLowerCase()) !== -1
				}))
			: countrySearchItems;
	});

	const initFromRange: Date | undefined = $derived(
		postItems
			? normalizeDate(postItems.reduce((earliest, current) => (current.date < earliest.date ? current : earliest)).date)
			: undefined
	);

	const initToRange: Date | undefined = $derived(
		postItems
			? normalizeDate(postItems.reduce((latest, current) => (current.date > latest.date ? current : latest)).date)
			: undefined
	);

	$effect(() => {
		if (initFromRange && initToRange) {
			initCalendar = { from: initFromRange, to: initToRange };
		}
	});

	const calendar: CalendarModel | undefined = $derived(
		initFromRange && initToRange ? { from: initFromRange, to: initToRange } : undefined
	);

	$effect(() => {
		executeDebouncedFilter(postItems, searchTerm, calendar, countrySearchItemsFiltered, filterTrigger);
	});

	const filterApplied = $derived(postsItemsFiltered && postsItemsFiltered.length !== postItems?.length);

	async function executeDebouncedFilter(
		items: BlogPostItem[] | undefined,
		term: string | undefined,
		calendar: CalendarModel | undefined,
		countries: BlogPostCountrySearchItem[] | undefined,
		_: number
	) {
		if (items && calendar?.from && calendar?.to && countries) {
			// Await the debounced filter result
			postsItemsFiltered = await debouncedFilter(postItems, term, calendar, countrySearchItemsFiltered, resetted);
		}
	}

	function selectDate(event: CustomEvent<{ from: Date; to: Date }>): void {
		const { from, to } = event.detail;
		if (calendar && from && to) {
			calendar.from = from;
			calendar.to = to;
			filterTrigger++;
		}
	}

	function debouncedFilter(
		items: BlogPostItem[] | undefined,
		term: string | undefined,
		calendar: CalendarModel | undefined,
		countries: BlogPostCountrySearchItem[] | undefined,
		_: boolean
	): Promise<BlogPostItem[] | undefined> {
		return debounce(() => (postsItemsFiltered = filterBlogPosts(items, term, calendar, countries)), 300)() as Promise<
			BlogPostItem[] | undefined
		>;
	}

	function normalizeDate(date: Date): Date {
		const newDate = new Date(date);
		newDate.setHours(0, 0, 0, 0);
		return newDate;
	}

	function filterBlogPosts(
		items: BlogPostItem[] | undefined,
		term: string | undefined,
		calendar: CalendarModel | undefined,
		countries: BlogPostCountrySearchItem[] | undefined
	): BlogPostItem[] | undefined {
		const result = items?.filter((post) => {
			const matchesTerm = term
				? !!getTranslation<BlogPostTranslation>(post.translations, $locale)
						?.title?.toLowerCase()
						.includes(term.toLowerCase())
				: true;
			const matchesDate =
				new Date(post.date) >= dayjs(calendar?.from).subtract(1, 'hour').toDate() &&
				new Date(post.date) <= dayjs(calendar?.to).add(1, 'day').toDate();
			const matchesCountries = countries?.some((country) => country.checked && country.postIds.includes(post.id));
			return matchesTerm && matchesDate && matchesCountries;
		});
		return result;
	}

	function lazyLoadBackground(entries: IntersectionObserverEntry[]): void {
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

	function registerObserver(node: HTMLDivElement): { destroy: () => void } {
		observers.push(node);
		observer?.observe(node);
		return {
			destroy() {
				observer?.unobserve(node);
			}
		};
	}

	function getBlogPostTranslation(
		translations: BlogPostTranslation[],
		locale: string | null | undefined
	): BlogPostTranslation | undefined {
		return getTranslation<BlogPostTranslation>(translations, locale);
	}

	function resetFilter(): void {
		resetted = true;
		searchTerm = '';
		countrySearchTerm = '';
		if (calendar && initFromRange && initToRange) {
			calendar.from = initFromRange;
			calendar.to = initToRange;
			initCalendar = { from: initFromRange, to: initToRange };
		}
		filterTrigger++;
	}

	function toggleSorting(): void {
		sort = sort === BlogPostSort.ASCENDING ? BlogPostSort.DESCENDING : BlogPostSort.ASCENDING;
		postItems?.reverse();
		filterTrigger++;
	}

	function toggleCountry(code: string): void {
		const country = countrySearchItemsFiltered?.find((country) => country.code === code);
		if (country) {
			country.checked = !country.checked;
			filterTrigger++;
		}
	}

	onMount(async () => {
		observer = new IntersectionObserver(lazyLoadBackground, {
			root: null,
			rootMargin: '0px',
			threshold: 0.01
		});
		observers.forEach((obs) => observer.observe(obs));
	});

	onDestroy(() => observer?.disconnect());
</script>

<div class="mx-auto max-w-screen-xl p-5 pt-0 dark:text-gray-100">
	{#if searchable}
		<div class="mb-5 flex-row items-center justify-between md:flex">
			<div class="flex items-center gap-2">
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
				{#if filterApplied}
					<div class="block md:hidden">
						<Button color="red" onclick={resetFilter}>
							<div class="h-6 w-6"><FaTrashAlt></FaTrashAlt></div>
						</Button>
					</div>
				{/if}
			</div>
			<div class="mt-3 flex flex-wrap items-center justify-center gap-2">
				{#if filterApplied}
					<div class="hidden md:block">
						<Button color="red" onclick={resetFilter}>
							<div class="h-6 w-6"><FaTrashAlt></FaTrashAlt></div>
						</Button>
					</div>
				{/if}
				{#if countrySearchItemsFiltered && initCalendar}
					<Datepicker
						inputClass="w-96 cursor-pointer"
						color="blue"
						rangeFrom={initCalendar.from}
						rangeTo={initCalendar.to}
						range
						locale={$locale ?? undefined}
						on:select={selectDate}
					></Datepicker>
					<div class="flex-auto">
						<Button class="w-full border text-black dark:text-white">
							{$t('components.posts.select-countries')}
							<span class="ml-2 h-6 w-6"> <FaChevronDown /></span></Button
						>
						<Dropdown class="h-44 overflow-y-auto px-3 pb-3 text-sm">
							<div slot="header" class="p-3">
								<Search size="md" bind:value={countrySearchTerm} />
							</div>
							{#each countrySearchItemsFiltered as country (country.code)}
								{#if country.visible}
									<li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
										<Checkbox checked={country.checked} on:change={() => toggleCountry(country.code)}
											>{country.name}</Checkbox
										>
									</li>
								{/if}
							{/each}
						</Dropdown>
					</div>
					{#if sort === BlogPostSort.ASCENDING}
						<button class="h-6 w-6 cursor-pointer" onclick={toggleSorting}>
							<FaArrowUp />
						</button>
					{:else}
						<button class="h-6 w-6 cursor-pointer" onclick={toggleSorting}>
							<FaArrowDown />
						</button>
					{/if}
				{/if}
			</div>
		</div>
	{/if}

	{#if !postsItemsFiltered}
		<div class="flex h-screen items-center justify-center">
			<Spinner size="24" color="blue" />
		</div>
	{:else if postsItemsFiltered && postsItemsFiltered.length === 0}
		<div class="text-center text-2xl font-semibold dark:text-gray-100">
			{$t('components.posts.no-posts')}
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{#each postsItemsFiltered as post (post.id)}
				<a
					href={`${PagePath.travel}/${post.id}`}
					class="xl:transition xl:delay-150 xl:duration-300 xl:ease-in-out xl:hover:-translate-y-1 xl:hover:scale-110"
				>
					<div
						class="relative flex h-96 w-full items-end justify-start bg-cover bg-center text-left dark:bg-gray-500"
						data-bg-url={post.thumbnailUrl}
						use:registerObserver
						style={`background-color: #6c7380;`}
					>
						<div
							class="absolute bottom-0 left-0 right-0 top-0 z-[-1] bg-gradient-to-b dark:from-gray-900 dark:via-transparent dark:to-gray-900"
						></div>
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
	{/if}
</div>

<style lang="postcss">
	.text-shadow {
		text-shadow:
			0 0 5px rgba(255, 255, 255, 0.5),
			0 0 10px rgba(255, 255, 255, 1);
	}
</style>
