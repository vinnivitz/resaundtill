<script lang="ts">
	import { Heading, Secondary, Hr, Tabs, TabItem, Spinner } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { locale, t } from 'svelte-i18n';
	import { Icon } from 'svelte-icons-pack';
	import {
		FaMap,
		FaSolidArrowLeft,
		FaSolidArrowRight,
		FaSolidCity,
		FaSolidMoneyBillWave,
		FaUser
	} from 'svelte-icons-pack/fa';

	import BlogPosts from '$lib/components/BlogPosts.svelte';
	import Map from '$lib/components/Map.svelte';
	import {
		PagePath,
		type BlogPostEntry,
		type CountryEntry,
		type CountryEntryTranslation,
		type CountryItemDetails,
		type MapItem
	} from '$lib/models';
	import { countriesStore, countryToPostsStore, postsStore } from '$lib/stores';
	import { formatNumber, getTranslation, isDefined, scrollTop } from '$lib/utils';

	import { goto } from '$app/navigation';

	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	const countryItem = $derived<CountryItemDetails | undefined>(getCountryItem(data?.countryCode, $countriesStore));

	const posts = $derived<BlogPostEntry[] | undefined>(getPosts(data?.countryCode, $postsStore, $countryToPostsStore));

	const mapItems = $derived<MapItem[] | undefined>(getMapItems(posts));

	const isNextPost = $derived(($countriesStore?.findIndex((country) => country.code === data.countryCode) ?? 0) > 0);

	const isPreviousPost = $derived(
		($countriesStore?.findIndex((country) => country.code === data.countryCode) ?? 0) <
			($countriesStore?.length ?? 1) - 1
	);

	onMount(() => scrollTop(false));

	async function getNextPost(): Promise<void> {
		if ($countriesStore) {
			const country = $countriesStore[$countriesStore.findIndex((country) => country.code === data.countryCode) - 1];
			await goto(`${PagePath.countries}/${country.code}`);
		}
	}

	async function getPreviousPost(): Promise<void> {
		if ($countriesStore) {
			const country = $countriesStore[$countriesStore.findIndex((post) => post.code === data.countryCode) + 1];
			await goto(`${PagePath.countries}/${country.code}`);
		}
	}

	function getPosts(
		code?: string,
		posts?: BlogPostEntry[],
		countryToPostsMap?: globalThis.Map<string, string[]>
	): BlogPostEntry[] | undefined {
		if (!code || !posts || !countryToPostsMap) {
			return;
		}
		const postIds = countryToPostsMap.get(data.countryCode);
		if (postIds) {
			return postIds
				.map((postId) => $postsStore?.find((post) => post.id === postId))
				.filter((post) => isDefined(post))
				.sort((a, b) => (new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1));
		}
	}

	function getCountryItem(code?: string, countries?: CountryEntry[]): CountryItemDetails | undefined {
		if (!code || !countries) {
			return;
		}
		const country = countries.find((country) => country.code === code);
		if (country) {
			const translations = getTranslation<CountryEntryTranslation>(country.translations, $locale);
			return {
				code: country.code,
				area: country.area,
				capital: translations?.capital ?? '',
				currency: translations?.currency ?? '',
				name: translations?.name ?? '',
				population: country.population,
				description: translations?.description
			};
		}
	}

	function getMapItems(posts: BlogPostEntry[] | undefined): MapItem[] | undefined {
		if (!posts) {
			return;
		}
		return posts.filter((post) => post.location) as MapItem[];
	}
</script>

<section class="px-3 md:px-12 md:py-4">
	<div class="mb-3 flex pt-2 md:pt-0">
		{#if isPreviousPost}
			<button
				onclick={getPreviousPost}
				class="flex items-center justify-center gap-2 rounded-full bg-gray-200 p-2 text-sm font-bold text-gray-800 active:bg-gray-400 md:hover:bg-gray-400"
			>
				<Icon src={FaSolidArrowLeft} size="18" />
				<div>{$t('countries.previous-country')}</div>
			</button>
		{:else}
			<div class="invisible flex rounded-full p-2"></div>
		{/if}
		<div class="grow"></div>
		{#if isNextPost}
			<button
				onclick={getNextPost}
				class="flex items-center justify-center gap-2 rounded-full bg-gray-200 p-2 text-sm font-bold text-gray-800 active:bg-gray-400 md:hover:bg-gray-400"
			>
				<div>{$t('countries.next-country')}</div>
				<Icon src={FaSolidArrowRight} size="18" />
			</button>
		{:else}
			<div class="invisible flex rounded-full px-4 py-2"></div>
		{/if}
	</div>
	{#if !countryItem}
		<div class="flex h-screen items-center justify-center">
			<Spinner size="24" color="blue" />
		</div>
	{:else}
		<div in:fly={{ y: 50, duration: 1000 }}>
			<Heading customSize="text-4xl md:text-5xl mt-5">
				<Secondary>
					<div class="flex gap-4">
						<span class={`fi fi-${countryItem.code}`}></span><span>{countryItem.name}</span>
					</div>
				</Secondary>
			</Heading>

			<Hr />

			<div class="block md:hidden">
				<Tabs tabStyle="underline" defaultClass="flex justify-center p-0">
					{#if countryItem.description}
						<TabItem open title={$t('common.information')} defaultClass="text-sm">
							<p class="whitespace-pre-wrap text-lg font-normal">
								{countryItem.description}
							</p>
						</TabItem>
					{/if}
					<TabItem open={!countryItem.description} title={$t('common.overview')} defaultClass="text-sm">
						<div class="flex flex-col gap-4">
							<div class="flex items-center gap-3">
								<Icon src={FaUser} size="28"></Icon>
								<div>
									{$t('common.population')}: {formatNumber(countryItem.population, $locale)}
									{$t('common.million')}
								</div>
							</div>
							<div class="flex items-center gap-3">
								<Icon src={FaMap} size="28"></Icon>
								<div>{$t('common.area')}: {formatNumber(countryItem.area, $locale)}m²</div>
							</div>
							<div class="flex items-center gap-3">
								<Icon src={FaSolidMoneyBillWave} size="28"></Icon>
								<div>{$t('common.currency')}: {countryItem.currency}</div>
							</div>
							<div class="flex items-center gap-3">
								<Icon src={FaSolidCity} size="28"></Icon>
								<div>{$t('common.capital')}: {countryItem.capital}</div>
							</div>
						</div>
					</TabItem>
					{#if posts && posts.length > 0}
						<TabItem title={$t('common.posts')} defaultClass="text-sm">
							<BlogPosts {posts} searchable countryFilter={false} />
						</TabItem>
					{/if}
					<TabItem title={$t('common.map')} defaultClass="p-0 text-sm">
						<Map
							items={mapItems}
							countryCode={countryItem.code}
							showWholeCountry
							activatable
							showCustomMarker
							navigate={async (id) => await goto(`${PagePath.travel}/${id}`)}
						/>
					</TabItem>
				</Tabs>
			</div>

			<div class="hidden md:block">
				{#if countryItem.description}
					<p class="whitespace-pre-wrap pb-4 text-lg font-normal">
						{countryItem.description}
					</p>
					<Hr />
				{/if}

				<div class="flex items-center justify-between gap-5">
					<div class="flex items-center gap-2">
						<Icon src={FaUser} size="24"></Icon>
						<div>{$t('common.population')}: {formatNumber(countryItem.population, $locale)} {$t('common.million')}</div>
					</div>
					<div class="flex items-center justify-center gap-2">
						<Icon src={FaMap} size="24"></Icon>
						<div>{$t('common.area')}: {formatNumber(countryItem.area, $locale)} km²</div>
					</div>
					<div class="flex gap-2">
						<Icon src={FaSolidMoneyBillWave} size="24"></Icon>
						<div>{$t('common.currency')}: {countryItem.currency}</div>
					</div>
					<div class="flex gap-2">
						<Icon src={FaSolidCity} size="24"></Icon>
						<div>{$t('common.capital')}: {countryItem.capital}</div>
					</div>
				</div>

				<Hr />
				<div class="m-2">
					<BlogPosts {posts} searchable countryFilter={false} />
				</div>

				<Hr />
				{#if mapItems && countryItem}
					<Map
						items={mapItems}
						countryCode={countryItem.code}
						showWholeCountry
						activatable
						showCustomMarker
						navigate={async (id) => await goto(`${PagePath.travel}/${id}`)}
					/>
				{/if}
			</div>
		</div>
	{/if}
</section>
