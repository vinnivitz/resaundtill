<script lang="ts">
	import { Heading, Secondary, Hr, Tabs, TabItem, Spinner } from 'flowbite-svelte';
	import { fly } from 'svelte/transition';
	import { locale, t } from 'svelte-i18n';
	// @ts-expect-error - Typings are missing
	import FaMap from 'svelte-icons/fa/FaMap.svelte';
	// @ts-expect-error - Typings are missing
	import FaMoneyBillWave from 'svelte-icons/fa/FaMoneyBillWave.svelte';
	// @ts-expect-error - Typings are missing
	import FaUser from 'svelte-icons/fa/FaUser.svelte';

	import BlogPosts from '$lib/components/BlogPosts.svelte';
	import Map from '$lib/components/Map.svelte';
	import {
		PagePath,
		type BlogPostEntry,
		type CountryEntryTranslation,
		type CountryItemDetails,
		type MapItem
	} from '$lib/models';
	import { countriesStore, countryToPostsStore, postsStore } from '$lib/stores';
	import { getTranslation } from '$lib/utils';

	import { goto } from '$app/navigation';

	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	const countryItem = $derived<CountryItemDetails | undefined>(
		(() => {
			if (data?.countryCode && $countriesStore && $countryToPostsStore && postsStore) {
				const country = $countriesStore?.find((country) => country.code === data.countryCode);
				if (country) {
					return {
						code: country.code,
						area: country.area,
						capital: country.capital,
						currency: country.currency,
						name: getTranslation<CountryEntryTranslation>(country.translations, $locale)?.name ?? '',
						population: country.population,
						posts: undefined,
						description: '',
						mapItems: []
					};
				} else {
					return undefined;
				}
			}
		})()
	);

	const posts = $derived<BlogPostEntry[] | undefined>(
		(() => {
			if (data.countryCode && $postsStore && $countryToPostsStore) {
				const postIds = $countryToPostsStore.get(data.countryCode);
				if (postIds) {
					return postIds
						.map((postId) => $postsStore?.find((post) => post.id === postId))
						.filter((post): post is BlogPostEntry => post !== undefined)
						.sort((a, b) => (new Date(a.date).getTime() > new Date(b.date).getTime() ? -1 : 1));
				}
			}
			return undefined;
		})()
	);

	const mapItems = $derived<MapItem[] | undefined>(
		posts
			? posts
					.filter((post) => post.location)
					.map((post) => ({ id: post.id, isFlight: post.isFlight, location: post.location! }))
			: undefined
	);
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
						<div class="mb-4 flex gap-2">
							<div class="h-6 w-6"><FaUser /></div>
							<div>{$t('common.population')}: {countryItem.population}</div>
						</div>
						<div class="mb-4 flex gap-2">
							<div class="h-6 w-6"><FaMap /></div>
							<div>{$t('common.area')}: {countryItem.area}m²</div>
						</div>
						<div class="mb-4 flex gap-2">
							<div class="h-6 w-6"><FaMoneyBillWave /></div>
							<div>
								{$t('common.currency')}: {countryItem.currency}
							</div>
						</div>
						<div class="mb-4 flex gap-2">
							<div class="h-6 w-6"><FaUser /></div>
							<div>{$t('common.capital')}: {countryItem.capital}</div>
						</div>
					</TabItem>
					{#if posts && posts.length > 0}
						<TabItem title={$t('common.posts')} defaultClass="text-lg">
							<BlogPosts {posts} searchable countryFilter={false} />
						</TabItem>
					{/if}
					<TabItem title={$t('common.map')} defaultClass="text-lg p-0">
						<Map
							items={countryItem.mapItems}
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

				<div class="flex justify-between gap-5">
					<div class="mb-4 flex gap-2">
						<div class="h-6 w-6"><FaUser /></div>
						<div>{$t('common.population')}: {countryItem.population}</div>
					</div>
					<div class="mb-4 flex gap-2">
						<div class="h-6 w-6"><FaMap /></div>
						<div>{$t('common.area')}: {countryItem.area}m²</div>
					</div>
					<div class="mb-4 flex gap-2">
						<div class="h-6 w-6"><FaMoneyBillWave /></div>
						<div>
							{$t('common.currency')}: {countryItem.currency}
						</div>
					</div>
					<div class="mb-4 flex gap-2">
						<div class="h-6 w-6"><FaUser /></div>
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
