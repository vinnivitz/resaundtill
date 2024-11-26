<script lang="ts">
	import { Input, Spinner } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { locale, t } from 'svelte-i18n';
	import { Icon } from 'svelte-icons-pack';
	import { IoSearch } from 'svelte-icons-pack/io';

	import {
		DirectusImageTransformation,
		PagePath,
		type CountryEntry,
		type CountryEntryTranslation,
		type CountryItem
	} from '$lib/models';
	import { countriesStore, countryToPostsStore } from '$lib/stores';
	import { debounce, getTranslation, imageUrlBuilder } from '$lib/utils';

	const observers: HTMLDivElement[] = [];
	let observer: IntersectionObserver;
	let searchTerm = $state<string | undefined>();
	let countriesFiltered = $state<CountryItem[] | undefined>();
	let filterTrigger = $state(0);

	const countryItems = $derived<CountryItem[] | undefined>(getCountryItems($countriesStore));

	$effect(() => debouncedFilter(countryItems, searchTerm, filterTrigger));

	function getCountryItems(items?: CountryEntry[]): CountryItem[] | undefined {
		if (!items) {
			return;
		}
		return items.map((country) => ({
			name: getTranslation<CountryEntryTranslation>(country.translations, $locale)?.name ?? '',
			code: country.code,
			thumbnailUrl: imageUrlBuilder(country.thumbnail, DirectusImageTransformation.PREVIEW)
		}));
	}

	function debouncedFilter(items: CountryItem[] | undefined, term: string | undefined, _: number): void {
		if (items) {
			debounce(() => (countriesFiltered = getFilteredCountries(items, term)), 300)();
		}
	}

	function getFilteredCountries(items: CountryItem[] | undefined, term: string | undefined): CountryItem[] | undefined {
		return items?.filter((item) => {
			const matchesTerm = term ? item.name.toLowerCase().includes(term.toLowerCase()) : true;
			return matchesTerm;
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
				observer.unobserve(node);
			}
		};
	}

	onMount(() => {
		observer = new IntersectionObserver(lazyLoadBackground, {
			root: undefined,
			rootMargin: '0px',
			threshold: 0.01
		});
		for (const obs of observers) {
			observer.observe(obs);
		}
	});
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="mx-auto max-w-screen-xl p-5 dark:text-gray-100">
	<div class="mx-auto max-w-screen-xl p-5 dark:text-gray-100">
		<div class="relative mb-5 w-full md:w-72">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<Icon src={IoSearch} size="24"></Icon>
			</div>
			<Input
				id="search-navbar"
				class="pl-14"
				placeholder={$t('components.gallery.searchbar.placeholder')}
				bind:value={searchTerm}
			/>
		</div>
		{#if !countriesFiltered}
			<div class="flex h-screen items-center justify-center">
				<Spinner size="24" color="blue" />
			</div>
		{:else if countriesFiltered.length === 0}
			<p>{$t('countries.no-entries')}</p>
		{:else}
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{#each countriesFiltered as country}
					<a
						href={`${PagePath.countries}/${country.code}`}
						class="relative xl:transition xl:delay-150 xl:duration-300 xl:ease-in-out xl:hover:-translate-y-1 xl:hover:scale-110"
					>
						<div
							class="relative flex h-96 w-full items-end justify-start bg-cover bg-center text-left dark:bg-gray-500"
							data-bg-url={country.thumbnailUrl}
							use:registerObserver
							style={`background-color: #6c7380;`}
						>
							<div
								class="absolute bottom-0 left-0 right-0 top-0 z-[-1] bg-gradient-to-b dark:from-gray-900 dark:via-transparent dark:to-gray-900"
							></div>
							<div
								class="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black to-transparent px-5 pb-40 pt-3"
							>
								<div class="flex items-center justify-start gap-2 text-center text-gray-700">
									<span class="text-3xl font-semibold leading-none tracking-wide">
										<span class={`fi fi-${country.code}`}></span>
									</span>
									<span class="text-center uppercase leading-none text-gray-300 opacity-90">
										{country.name}
									</span>
								</div>
							</div>
						</div>
						<div
							class="absolute bottom-0 left-0 right-0 flex h-1/2 items-end bg-gradient-to-t from-black to-transparent p-2 font-normal text-gray-300"
						>
							{#if $countryToPostsStore}
								{$t('countries.posts')}: {$countryToPostsStore.get(country.code)?.length ?? 0}
							{/if}
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>
