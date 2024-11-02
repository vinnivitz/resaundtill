<script lang="ts">
	import {
		DirectusImageTransformation,
		PagePath,
		type BlogPostEntry,
		type BlogPostImage,
		type BlogPostItem,
		type BlogPostTranslation,
		type CalendarStore,
		type CountryEntry,
		type CountryEntryTranslation,
		type GeoFeatureCollection
	} from '$lib/models';
	import { debounce, getTranslation, imageUrlBuilder, isPointInPolygon } from '$lib/utils';
	import { Input } from 'flowbite-svelte';
	import { onMount, tick } from 'svelte';
	import { locale } from 'svelte-i18n';
	// @ts-expect-error - Ignore this error
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import { t } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import { Datepicker } from './calendar';
	import dayjs from 'dayjs';
	import { Button, Dropdown, Checkbox, Search } from 'flowbite-svelte';
	// @ts-expect-error - Ignore this error
	import FaChevronDown from 'svelte-icons/fa/FaChevronDown.svelte';
	// @ts-expect-error - Ignore this error
	import FaTrashAlt from 'svelte-icons/fa/FaTrashAlt.svelte';

	export let posts: BlogPostEntry[];
	export let thumbnails: Map<string, BlogPostImage>;
	export let searchable = false;
	export let countries: CountryEntry[] = [];

	const observers: HTMLDivElement[] = [];
	let observer: IntersectionObserver;
	let searchTerm: string;
	let postItems: BlogPostItem[] = [];
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
	let countrySearch: string;
	let countryItems: { name: string; code: string; checked: boolean; postIds: string[] }[];
	let countryItemsFiltered: { name: string; code: string; checked: boolean; postIds: string[] }[] = [];
	let filterApplied = false;
	let loading = true;
	let resetted = false;

	postItems = posts.map((post) => {
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

	$: filterApplied =
		(postItemsFiltered?.length !== postItems?.length || countryItemsFiltered?.length !== countryItems?.length) &&
		!loading;

	postItemsFiltered = postItems;

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
	$: fromDatepickerEnd = toDate;
	$: toDatepickerStart = fromDate;
	toDatepickerEnd = initEndDate;

	$: fromDatepickerEnd = toDate;
	$: toDatepickerStart = fromDate;

	const debouncedSearch = debounce(async () => {
		postItemsFiltered = filterBlogPosts(postItems, searchTerm, fromDate, toDate);
		await tick();
	}, 300);

	$: if (browser && countrySearch !== undefined) {
		countryItemsFiltered = countryItems.filter(
			(country) => country.name.toLowerCase().indexOf(countrySearch?.toLowerCase()) !== -1
		);
	}

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
		return posts.filter(
			(post) =>
				(lowerCaseTerm
					? getBlogPostTranslation(post.translations, $locale)?.title?.toLowerCase().includes(lowerCaseTerm)
					: true) &&
				post.date >= dayjs(from).subtract(1, 'day').toDate() &&
				post.date <= dayjs(to).add(1, 'day').toDate() &&
				countryItemsFiltered.some((country) => country.checked && country.postIds.includes(post.id))
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

	function resetFilter() {
		resetted = true;
		searchTerm = '';
		fromDate = initStartDate;
		toDate = initEndDate;
		fromDatepickerStart = initStartDate;
		toDatepickerEnd = initEndDate;
		countryItemsFiltered = countryItems;
		postItemsFiltered = postItems;
	}

	onMount(async () => {
		observer = new IntersectionObserver(lazyLoadBackground, {
			root: null,
			rootMargin: '0px',
			threshold: 0.01
		});

		observers.forEach((obs) => observer.observe(obs));
		if (searchable) {
			fromCalendarStore.subscribe((data) => {
				if (data.hasChosen && !data.open && data.selected !== fromDate) {
					fromDate = data.selected;
					if (fromDate > toDate) {
						toDate = fromDate;
					}
					debouncedSearch();
					resetted = false;
				}
			});
			toCalendarStore.subscribe((data) => {
				if (data.hasChosen && !data.open && data.selected !== toDate) {
					toDate = data.selected;
					if (toDate < fromDate) {
						fromDate = toDate;
					}
					debouncedSearch();
					resetted = false;
				}
			});
		}
		const geojsonResult = await fetch('/json/countries.geojson');
		const collection: GeoFeatureCollection = await geojsonResult.json();
		countryItems = countries.map((country) => {
			const feature = collection.features.find(
				(feature) => feature.properties.ISO_A2.toLowerCase() === country.code.toLowerCase()
			);
			return {
				name: getTranslation<CountryEntryTranslation>(country.translations, $locale)?.name ?? '',
				checked: true,
				code: country.code.toLowerCase(),
				postIds: posts
					.filter(
						(post) =>
							post.location &&
							feature?.geometry.coordinates &&
							isPointInPolygon(post.location.coordinates, feature?.geometry.coordinates)
					)
					.map((post) => post.id)
			};
		});
		const categorizedPostIds = new Set(countryItems.flatMap((country) => country.postIds));
		const uncategorizedPostIds = posts.filter((post) => !categorizedPostIds.has(post.id)).map((post) => post.id);
		countryItems.push({
			name: $t('components.posts.country-filter-not-categorized'),
			checked: true,
			code: '',
			postIds: uncategorizedPostIds
		});

		countryItemsFiltered = countryItems;
		loading = false;
	});
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
						<Button color="red" on:click={resetFilter}>
							<div class="h-6 w-6"><FaTrashAlt></FaTrashAlt></div>
						</Button>
					</div>
				{/if}
			</div>
			<div class="mt-3 flex items-center justify-center gap-2">
				<div>{$t('common.from')}</div>
				<Datepicker
					bind:store={fromCalendarStore}
					selected={fromDate}
					bind:start={fromDatepickerStart}
					bind:end={fromDatepickerEnd}
					format="DD.MM.YYYY"
					reset={resetted}
				/>
				<div>{$t('common.to')}</div>
				<Datepicker
					bind:store={toCalendarStore}
					selected={toDate}
					bind:start={toDatepickerStart}
					bind:end={toDatepickerEnd}
					format="DD.MM.YYYY"
					reset={resetted}
				/>
				<div class="flex-1">
					<Button class="w-full border text-black dark:text-white">
						{$t('components.posts.select-countries')}
						<span class="ml-2 h-6 w-6"> <FaChevronDown class="ms-2 h-6 w-6 text-white dark:text-white" /></span></Button
					>
					<Dropdown class="h-44 overflow-y-auto px-3 pb-3 text-sm">
						<div slot="header" class="p-3">
							<Search size="md" bind:value={countrySearch} />
						</div>
						{#each countryItemsFiltered as country}
							<li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
								<Checkbox bind:checked={country.checked} on:change={debouncedSearch}>{country.name}</Checkbox>
							</li>
						{/each}
					</Dropdown>
				</div>
				{#if filterApplied}
					<div class="hidden md:block">
						<Button color="red" on:click={resetFilter}>
							<div class="h-6 w-6"><FaTrashAlt></FaTrashAlt></div>
						</Button>
					</div>
				{/if}
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
