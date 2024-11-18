<script lang="ts">
	import dayjs from 'dayjs';
	import { Input, Spinner, Button, Dropdown, Checkbox, Search, Datepicker } from 'flowbite-svelte';
	import { onDestroy, onMount } from 'svelte';
	import { fly } from 'svelte/transition';
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
	import { dateStore } from '$lib/stores';
	import { countriesStore, countryToPostsStore, postToImagesStore } from '$lib/stores/data.store';
	import { debounce, getTranslation, imageUrlBuilder } from '$lib/utils';

	let {
		posts,
		searchable = false,
		countryFilter = true,
		sort = BlogPostSort.DESCENDING
	}: {
		posts: BlogPostEntry[] | undefined;
		searchable?: boolean;
		countryFilter?: boolean;
		sort?: BlogPostSort;
	} = $props();

	let observer: IntersectionObserver;
	const observers: HTMLDivElement[] = [];

	let searchTerm: string | undefined = $state();
	let countrySearchTerm: string | undefined = $state();
	let filterTrigger = $state(0);
	let initCalendar = $state<CalendarModel>({});

	let postsItemsFiltered = $state<BlogPostItem[] | undefined>();
	let countrySearchItemsFiltered = $state<BlogPostCountrySearchItem[] | undefined>();

	const postItems: BlogPostItem[] | undefined = $derived(
		posts && $postToImagesStore
			? posts.map((post) => {
					const imageId = $postToImagesStore.get(post.id)?.[0]?.id;
					return {
						id: post.id,
						date: new Date(post.date),
						translations: post.translations,
						thumbnailUrl: imageUrlBuilder(imageId, DirectusImageTransformation.PREVIEW)
					};
				})
			: undefined
	);

	const countrySearchItems: BlogPostCountrySearchItem[] | undefined = $derived(
		countryFilter && postItems && $countriesStore && $countryToPostsStore
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

	const initFromRange: Date | undefined = $derived(
		searchable && postItems
			? normalizeDate(postItems.reduce((earliest, current) => (current.date < earliest.date ? current : earliest)).date)
			: undefined
	);

	const initToRange: Date | undefined = $derived(
		searchable && postItems
			? normalizeDate(postItems.reduce((latest, current) => (current.date > latest.date ? current : latest)).date)
			: undefined
	);

	const calendar: CalendarModel | undefined = $derived(
		initFromRange && initToRange ? { from: initFromRange, to: initToRange } : undefined
	);

	const filterApplied = $derived(postsItemsFiltered && postsItemsFiltered.length !== postItems?.length);

	$effect(() => {
		countrySearchItemsFiltered =
			countryFilter && countrySearchTerm
				? countrySearchItems?.map((country) => ({
						...country,
						visible: country.name.toLowerCase().includes(countrySearchTerm!.toLowerCase())
					}))
				: countrySearchItems;
	});

	$effect(() => {
		if (searchable && initFromRange && initToRange) {
			initCalendar = { from: initFromRange, to: initToRange };
		}
	});

	$effect(() => debouncedFilter(postItems, searchTerm, calendar, countrySearchItemsFiltered, filterTrigger));

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
		_: number
	): void {
		if (items && (!searchable || (calendar?.from && calendar?.to && (!countryFilter || countries)))) {
			debounce(() => (postsItemsFiltered = getFilteredPosts(items, term, calendar, countries)), 300)();
		}
	}

	function normalizeDate(date: Date): Date {
		const newDate = new Date(date);
		newDate.setHours(0, 0, 0, 0);
		return newDate;
	}

	function getFilteredPosts(
		items: BlogPostItem[] | undefined,
		term: string | undefined,
		calendar: CalendarModel | undefined,
		countries: BlogPostCountrySearchItem[] | undefined
	): BlogPostItem[] | undefined {
		return items?.filter((post) => {
			const matchesTerm =
				!searchable ||
				(term
					? getTranslation<BlogPostTranslation>(post.translations, $locale)
							?.title?.toLowerCase()
							.includes(term.toLowerCase())
					: true);
			const matchesDate =
				!searchable ||
				(new Date(post.date) >= dayjs(calendar?.from).subtract(1, 'hour').toDate() &&
					new Date(post.date) <= dayjs(calendar?.to).add(1, 'day').toDate());
			const matchesCountries =
				!countryFilter || countries?.some((country) => country.checked && country.postIds.includes(post.id));
			return !searchable || (matchesTerm && matchesDate && matchesCountries);
		});
	}

	function lazyLoadBackground(entries: IntersectionObserverEntry[]): void {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				const element = entry.target as HTMLDivElement;
				if (element) {
					element.style.backgroundImage = `url(${element.dataset.bgUrl})`;
					observer.unobserve(element);
				}
			}
		}
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
			root: undefined,
			rootMargin: '0px',
			threshold: 0.01
		});
		for (const obs of observers) observer.observe(obs);
	});

	onDestroy(() => observer?.disconnect());
</script>

<div class="mx-auto max-w-screen-xl dark:text-gray-100">
	{#if searchable}
		<div class="mb-7 flex-row items-center justify-between md:flex">
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
			<div class="mt-3 flex items-center justify-center gap-2">
				{#if filterApplied}
					<div class="hidden md:block">
						<Button color="red" onclick={resetFilter}>
							<div class="h-[15px] w-6"><FaTrashAlt></FaTrashAlt></div>
						</Button>
					</div>
				{/if}
				{#if initCalendar && initCalendar.from && initCalendar.to}
					<div class="flex-1 md:w-80 md:flex-auto">
						<div class="block md:hidden">
							<Datepicker
								inputClass="cursor-pointer"
								color="blue"
								rangeFrom={initCalendar.from}
								rangeTo={initCalendar.to}
								range
								dateFormat={{ formatMatcher: 'best fit', day: '2-digit', month: '2-digit', year: '2-digit' }}
								locale={$locale ?? undefined}
								on:select={selectDate}
							></Datepicker>
						</div>
						<div class="hidden md:block">
							<Datepicker
								inputClass="cursor-pointer"
								color="blue"
								rangeFrom={initCalendar.from}
								rangeTo={initCalendar.to}
								range
								locale={$locale ?? undefined}
								on:select={selectDate}
								defaultDate={initCalendar.from}
							></Datepicker>
						</div>
					</div>
				{/if}
				{#if countrySearchItemsFiltered}
					<div class="flex-1">
						<Button class="w-full border border-gray-600 px-2 py-[5px] text-black dark:text-white">
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
				{/if}
				{#if sort === BlogPostSort.ASCENDING}
					<button class="h-6 w-6 cursor-pointer" onclick={toggleSorting}>
						<FaArrowUp />
					</button>
				{:else}
					<button class="h-6 w-6 cursor-pointer" onclick={toggleSorting}>
						<FaArrowDown />
					</button>
				{/if}
			</div>
		</div>
	{/if}

	{#if !postsItemsFiltered}
		<div class="flex h-screen items-center justify-center">
			<Spinner size="24" color="blue" />
		</div>
	{:else if postsItemsFiltered.length === 0}
		<div class="text-center text-2xl font-semibold dark:text-gray-100">
			{$t('components.posts.no-posts')}
		</div>
	{:else}
		<div class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{#each postsItemsFiltered as post (post.id)}
				<a
					in:fly={{ y: 50, duration: 1000 }}
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
									{$dateStore(post.date, 'DD')}
								</span>
								<span class="text-shadow uppercase leading-none">
									{$dateStore(post.date, 'MMMM')}
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
