<script lang="ts">
	import { Heading, Secondary, Hr, Tabs, TabItem, Spinner } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { locale, t } from 'svelte-i18n';
	import { Icon } from 'svelte-icons-pack';
	import { FaMap, FaSolidCity, FaSolidMoneyBillWave, FaUser } from 'svelte-icons-pack/fa';

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
	import { getTranslation, isDefined, scrollTop } from '$lib/utils';

	import { goto } from '$app/navigation';

	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	const countryItem = $derived<CountryItemDetails | undefined>(getCountryItem(data?.countryCode, $countriesStore));

	const posts = $derived<BlogPostEntry[] | undefined>(getPosts(data?.countryCode, $postsStore, $countryToPostsStore));

	const mapItems = $derived<MapItem[] | undefined>(getMapItems(posts));

	onMount(() => scrollTop(false));

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
			return {
				code: country.code,
				area: country.area,
				capital: country.capital,
				currency: country.currency,
				name: getTranslation<CountryEntryTranslation>(country.translations, $locale)?.name ?? '',
				population: country.population,
				description: ''
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

<section class="p-3 md:px-12 md:py-4">
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
				<Tabs tabStyle="underline" defaultClass="flex justify-center">
					{#if countryItem.description}
						<TabItem open title={$t('common.information')} defaultClass="text-lg">
							<p class="whitespace-pre-wrap text-lg font-normal">
								{countryItem.description}
							</p>
						</TabItem>
					{/if}
					<TabItem open={!countryItem.description} title={$t('common.overview')} defaultClass="text-lg">
						<div class="flex flex-col gap-4">
							<div class="flex items-center gap-3">
								<Icon src={FaUser} size="28"></Icon>
								<div>{$t('common.population')}: {countryItem.population}</div>
							</div>
							<div class="flex items-center gap-3">
								<Icon src={FaMap} size="28"></Icon>
								<div>{$t('common.area')}: {countryItem.area}m²</div>
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
						<TabItem title={$t('common.posts')} defaultClass="text-lg">
							<BlogPosts {posts} searchable countryFilter={false} />
						</TabItem>
					{/if}
					<TabItem title={$t('common.map')} defaultClass="text-lg p-0">
						<Map
							items={mapItems}
							countryCode={countryItem.code}
							activatable={true}
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
						<div>{$t('common.population')}: {countryItem.population}</div>
					</div>
					<div class="flex items-center justify-center gap-2">
						<Icon src={FaMap} size="24"></Icon>
						<div>{$t('common.area')}: {countryItem.area}m²</div>
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
						activatable={true}
						navigate={async (id) => await goto(`${PagePath.travel}/${id}`)}
					/>
				{/if}
			</div>
		</div>
	{/if}
</section>
