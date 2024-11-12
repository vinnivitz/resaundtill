<script lang="ts">
	import {
		BlogPostSort,
		PagePath,
		type BlogPostCountrySearchItem,
		type BlogPostEntry,
		type BlogPostItem,
		type BlogPostTranslation,
		type CalendarModel,
		type CountryEntryTranslation
	} from '$lib/models';
	import { debounce, getTranslation, imageUrlBuilder } from '$lib/utils';
	import { Input, Spinner } from 'flowbite-svelte';
	import { onDestroy, onMount } from 'svelte';
	import { locale } from 'svelte-i18n';
	// @ts-ignore
	import FaSearch from 'svelte-icons/fa/FaSearch.svelte';
	import { t } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import { Datepicker } from './calendar';
	import dayjs from 'dayjs';
	import { Button, Dropdown, Checkbox, Search } from 'flowbite-svelte';
	// @ts-ignore
	import FaChevronDown from 'svelte-icons/fa/FaChevronDown.svelte';
	// @ts-ignore
	import FaTrashAlt from 'svelte-icons/fa/FaTrashAlt.svelte';
	import { dataStore } from '$lib/stores/data.store';
	import type { Unsubscriber } from 'svelte/store';
	// @ts-expect-error - Typings are missing
	import FaArrowDown from 'svelte-icons/fa/FaArrowDown.svelte';
	// @ts-expect-error - Typings are missing
	import FaArrowUp from 'svelte-icons/fa/FaArrowUp.svelte';

	export let posts: BlogPostEntry[];
	export let searchable = false;
	export let sort = BlogPostSort.DESCENDING;

	let postItems: BlogPostItem[];

	let initialized = false;

	const observers: HTMLDivElement[] = [];
	let calendarModel: CalendarModel = {};

	let postsFiltered: BlogPostItem[];

	let observer: IntersectionObserver;

	let searchTerm: string;
	let countrySearchTerm: string;

	let countrySearchItems: BlogPostCountrySearchItem[];
	let countrySearchItemsFiltered: BlogPostCountrySearchItem[];

	let filterApplied = false;
	let resetted = false;

	let fromCalendarUnsubscriber: Unsubscriber | undefined;
	let toCalendarUnsubscriber: Unsubscriber | undefined;

	calendarModel = { ...calendarModel, from: calendarModel.start };
	calendarModel = { ...calendarModel, to: calendarModel.end };

	$: if (posts && $dataStore?.postToImages) {
		if (!initialized) {
			postItems = posts.map((post) => ({
				id: post.id,
				date: new Date(post.date),
				formattedDate: dayjs().format('DD. MMMM'),
				translations: post.translations,
				thumbnailUrl: $dataStore.postToImages.get(post.id)?.[0] ?? '/images/gallery/travel.jpg'
			}));
			postItems = [...(sort === BlogPostSort.ASCENDING ? postItems.reverse() : postItems)];
			postsFiltered = [...postItems];
			initialized = true;
		}

		if ($dataStore?.countries && $dataStore?.countryToPosts && !countrySearchItemsFiltered) {
			countrySearchItems = $dataStore.countries.map((country) => ({
				name: getTranslation<CountryEntryTranslation>(country.translations, $locale)?.name ?? '',
				checked: true,
				code: country.code,
				postIds: $dataStore.countryToPosts.get(country.code) ?? []
			}));
			const categorizedPostIds = new Set(countrySearchItems.flatMap((country) => country.postIds));
			const uncategorizedPostIds = postItems.filter((post) => !categorizedPostIds.has(post.id)).map((post) => post.id);
			countrySearchItems.push({
				name: $t('components.posts.country-filter-not-categorized'),
				checked: true,
				code: '',
				postIds: uncategorizedPostIds
			});
			countrySearchItemsFiltered = [...countrySearchItems];
		}

		if (!calendarModel.start && !calendarModel.from) {
			const earliestDate = normalizeDate(
				postItems.reduce((earliest, current) => (current.date < earliest.date ? current : earliest)).date ?? new Date()
			);
			calendarModel = {
				...calendarModel,
				start: earliestDate,
				from: earliestDate
			};
		}

		if (!calendarModel.end && !calendarModel.to) {
			const latestDate = normalizeDate(
				postItems.reduce((latest, current) => (current.date > latest.date ? current : latest)).date ?? new Date()
			);
			calendarModel = {
				...calendarModel,
				end: latestDate,
				to: latestDate
			};
		}
	}

	$: filterApplied =
		postsFiltered?.length !== postItems?.length || countrySearchItemsFiltered?.length !== countrySearchItems?.length;

	$: calendarModel = { ...calendarModel, fromEnd: calendarModel.to };
	$: calendarModel = { ...calendarModel, toStart: calendarModel.from };

	const debouncedSearch = debounce(async () => (postsFiltered = filterBlogPosts()), 300);

	$: if (countrySearchTerm !== undefined) {
		countrySearchItemsFiltered = [
			...countrySearchItems.filter(
				(country) => country.name.toLowerCase().indexOf(countrySearchTerm?.toLowerCase()) !== -1
			)
		];
	}

	$: if (searchTerm !== undefined) {
		debouncedSearch();
	}

	$: if (calendarModel.fromCalendar && !fromCalendarUnsubscriber) {
		subscribeFromCalendar();
	}

	$: if (calendarModel.toCalendar && !toCalendarUnsubscriber) {
		subscribeToCalendar();
	}

	function normalizeDate(date: Date): Date {
		const newDate = new Date(date);
		newDate.setHours(0, 0, 0, 0);
		return newDate;
	}

	function filterBlogPosts() {
		return postItems.filter((post) => {
			const matchesTerm = searchTerm
				? !!getTranslation<BlogPostTranslation>(post.translations, $locale)
						?.title?.toLowerCase()
						.includes(searchTerm.toLowerCase())
				: true;
			const matchesDate =
				post.date >= dayjs(calendarModel.from).subtract(1, 'hour').toDate() &&
				post.date <= dayjs(calendarModel.to).add(1, 'day').toDate();
			const matchesCountries = countrySearchItemsFiltered.some(
				(country) => country.checked && country.postIds.includes(post.id)
			);
			return matchesTerm && matchesDate && matchesCountries;
		});
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
		calendarModel = { ...calendarModel, from: calendarModel.start };
		calendarModel = { ...calendarModel, to: calendarModel.end };
		countrySearchItemsFiltered = [...countrySearchItems];
		postsFiltered = [...postItems];
	}

	function toggleCountrySelection(code: string) {
		countrySearchItemsFiltered = countrySearchItemsFiltered.map((country) =>
			country.code === code ? { ...country, checked: !country.checked } : country
		);
		debouncedSearch();
	}

	function subscribeFromCalendar() {
		fromCalendarUnsubscriber = calendarModel.fromCalendar?.subscribe((data) => {
			if (data.hasChosen && !data.open) {
				calendarModel = { ...calendarModel, from: data.selected };
				if (calendarModel.from && calendarModel.to && calendarModel.from > calendarModel.to) {
					calendarModel = { ...calendarModel, to: calendarModel.from };
				}
				debouncedSearch();
				resetted = false;
			}
		});
	}

	function subscribeToCalendar() {
		toCalendarUnsubscriber = calendarModel.toCalendar?.subscribe((data) => {
			if (data.hasChosen && !data.open) {
				calendarModel = { ...calendarModel, to: data.selected };
				if (calendarModel.to && calendarModel.from && calendarModel.to < calendarModel.from) {
					calendarModel = { ...calendarModel, from: calendarModel.to };
				}
				debouncedSearch();
				resetted = false;
			}
		});
	}

	function toggleSorting() {
		sort = sort === BlogPostSort.ASCENDING ? BlogPostSort.DESCENDING : BlogPostSort.ASCENDING;
		postItems.reverse();
		postsFiltered = [...postItems];
	}

	onMount(async () => {
		observer = new IntersectionObserver(lazyLoadBackground, {
			root: null,
			rootMargin: '0px',
			threshold: 0.01
		});
		observers.forEach((obs) => observer.observe(obs));
	});

	onDestroy(() => {
		observer?.disconnect();
		fromCalendarUnsubscriber?.();
		toCalendarUnsubscriber?.();
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
				{#if filterApplied}
					<div class="hidden md:block">
						<Button color="red" on:click={resetFilter}>
							<div class="h-6 w-6"><FaTrashAlt></FaTrashAlt></div>
						</Button>
					</div>
				{/if}
				{#if postItems && calendarModel.from && calendarModel.to && calendarModel.start && calendarModel.end}
					<div>{$t('common.from')}</div>
					<Datepicker
						bind:store={calendarModel.fromCalendar}
						bind:selected={calendarModel.from}
						bind:start={calendarModel.start}
						bind:end={calendarModel.fromEnd}
						format="DD.MM.YYYY"
						reset={resetted}
						on:mount={() => subscribeFromCalendar()}
					/>
					<div>{$t('common.to')}</div>
					<Datepicker
						bind:store={calendarModel.toCalendar}
						selected={calendarModel.to}
						bind:start={calendarModel.toStart}
						bind:end={calendarModel.end}
						format="DD.MM.YYYY"
						reset={resetted}
						on:mount={() => subscribeToCalendar()}
					/>
					<div class="flex-1">
						<Button class="w-full border text-black dark:text-white">
							{$t('components.posts.select-countries')}
							<span class="ml-2 h-6 w-6"> <FaChevronDown /></span></Button
						>
						<Dropdown class="h-44 overflow-y-auto px-3 pb-3 text-sm">
							<div slot="header" class="p-3">
								<Search size="md" bind:value={countrySearchTerm} />
							</div>
							{#each countrySearchItemsFiltered as country (country.code)}
								<li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
									<Checkbox checked={country.checked} on:change={() => toggleCountrySelection(country.code)}
										>{country.name}</Checkbox
									>
								</li>
							{/each}
						</Dropdown>
					</div>
					{#if sort === BlogPostSort.ASCENDING}
						<button class="h-6 w-6 cursor-pointer" on:click={toggleSorting}>
							<FaArrowUp />
						</button>
					{:else}
						<button class="h-6 w-6 cursor-pointer" on:click={toggleSorting}>
							<FaArrowDown />
						</button>
					{/if}
				{/if}
			</div>
		</div>
	{/if}

	{#if !postsFiltered}
		<div class="flex h-screen items-center justify-center">
			<Spinner size="24" color="blue" />
		</div>
	{:else if postsFiltered && postsFiltered.length === 0}
		<div class="text-center text-2xl font-semibold dark:text-gray-100">
			{$t('components.posts.no-posts')}
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{#each postsFiltered as post (post.id)}
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
						/>
						<div class="absolute left-0 right-0 top-0 mx-5 mt-3 flex items-center justify-between">
							<div class="flex flex-col justify-start text-center text-gray-700">
								<span class="text-shadow text-3xl font-semibold leading-none tracking-wide">
									{post.formattedDate}
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
