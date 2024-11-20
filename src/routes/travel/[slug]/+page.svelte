<script lang="ts">
	import { Heading, Secondary, Hr, Tabs, TabItem } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { t, locale } from 'svelte-i18n';
	// @ts-expect-error - no types available
	import FaArrowLeft from 'svelte-icons/fa/FaArrowLeft.svelte';
	// @ts-expect-error - no types available
	import FaArrowRight from 'svelte-icons/fa/FaArrowRight.svelte';
	// @ts-expect-error - no types available
	import FaCalendar from 'svelte-icons/fa/FaCalendar.svelte';

	import Gallery from '$lib/components/Gallery.svelte';
	import Map from '$lib/components/Map.svelte';
	import {
		DirectusImageTransformation,
		PagePath,
		type BlogPostEntry,
		type BlogPostItemDetails,
		type BlogPostTranslation,
		type CountryEntryTranslation,
		type ImageDetails,
		type MapItem
	} from '$lib/models';
	import {
		countriesStore,
		dateStore,
		mapItemsStore,
		postsStore,
		postToCountryStore,
		postToImagesStore
	} from '$lib/stores';
	import { getTranslation, scrollTop } from '$lib/utils';

	import { goto } from '$app/navigation';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const postItem: BlogPostItemDetails | undefined = $derived(getPostItems($postsStore, $postToImagesStore));

	const isNextPost = $derived($postsStore && ($postsStore.findIndex((post) => post.id === data.postId) ?? 0) > 0);
	const isPreviousPost = $derived(
		($postsStore?.findIndex((post) => post.id === data.postId) ?? 0) < ($postsStore?.length ?? 1) - 1
	);

	const translatedTitle = $derived(getTranslation<BlogPostTranslation>(postItem?.translations, $locale)?.title);

	const translatedDescription = $derived(
		getTranslation<BlogPostTranslation>(postItem?.translations, $locale)?.description
	);

	const countryCode = $derived(postItem && $postToCountryStore && $postToCountryStore.get(postItem?.id));

	const countryName = $derived(
		getTranslation<CountryEntryTranslation>(
			$countriesStore?.find((country) => country.code === countryCode)?.translations ?? [],
			$locale
		)?.name
	);

	const mapItems = $derived<MapItem[] | undefined>(getMapItems(postItem?.id, $mapItemsStore));

	onMount(() => scrollTop(false));

	function getPostItems(
		items?: BlogPostEntry[],
		postToImageMap?: globalThis.Map<string, ImageDetails[]>
	): BlogPostItemDetails | undefined {
		if (!items || !postToImageMap) {
			return;
		}
		const post = items?.find((post) => post.id === data.postId);
		if (!post) {
			goto(PagePath.travel);
			return;
		}
		return {
			id: post.id,
			date: new Date(post.date),
			translations: post.translations,
			images: postToImageMap.get(post.id) ?? []
		};
	}

	async function getNextPost(): Promise<void> {
		if ($postsStore) {
			const post = $postsStore[$postsStore.findIndex((post) => post.id === data.postId) - 1];
			await goto(`${PagePath.travel}/${post.id}`);
		}
	}

	async function getPreviousPost(): Promise<void> {
		if ($postsStore) {
			const post = $postsStore[$postsStore.findIndex((post) => post.id === data.postId) + 1];
			await goto(`${PagePath.travel}/${post.id}`);
		}
	}

	function getMapItems(postId?: string, items?: MapItem[]): MapItem[] | undefined {
		if (!postId || !items) {
			return;
		}
		return items.filter((item) => item.id === postId);
	}

	async function gotoCountry(): Promise<void> {
		return goto(`${PagePath.countries}/${countryCode}`);
	}
</script>

<section class="px-3 md:px-12 md:pt-4">
	<div class="mb-3 flex pt-2 md:pt-0">
		{#if isPreviousPost}
			<button
				onclick={getPreviousPost}
				class="flex rounded-full bg-gray-200 px-4 py-2 align-middle text-sm font-bold leading-6 text-gray-800 hover:bg-gray-400"
			>
				<div class="h-6 w-6"><FaArrowLeft /></div>
				<div class="pl-2">{$t('travel.header.prev-button.label')}</div>
			</button>
		{:else}
			<div class="invisible flex rounded-full px-4 pt-2"></div>
		{/if}
		<div class="grow"></div>
		{#if isNextPost}
			<button
				onclick={getNextPost}
				class="flex rounded-full bg-gray-200 px-4 py-2 align-middle text-sm font-bold leading-6 text-gray-800 hover:bg-gray-400"
			>
				<div class="pr-2">{$t('travel.header.next-button.label')}</div>
				<div class="h-6 w-6"><FaArrowRight /></div>
			</button>
		{:else}
			<div class="invisible flex rounded-full px-4 py-2"></div>
		{/if}
	</div>

	<div in:fly={{ y: 50, duration: 1000 }}>
		<Heading customSize="text-4xl md:text-5xl mt-6">
			<Secondary>{translatedTitle}</Secondary>
		</Heading>
		<Hr />

		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<div class="h-6 w-6"><FaCalendar /></div>
				<div class="pt-1 text-sm md:text-lg">
					{$dateStore(postItem?.date, 'DD. MMMM YYYY')}
				</div>
			</div>
			{#if countryCode}
				<button
					class="flex items-center gap-2 rounded bg-gray-100 p-1 text-xl hover:bg-gray-300 dark:border-gray-700 dark:bg-gray-800 hover:dark:bg-gray-900"
					onclick={gotoCountry}
				>
					<div class={`fi fi-${countryCode}`}></div>
					<div>{countryName}</div>
				</button>
			{/if}
		</div>

		<div class="mt-7 block md:hidden">
			<Tabs tabStyle="underline" defaultClass="flex justify-center">
				{#if translatedDescription}
					<TabItem open title={$t('travel.description')} defaultClass="text-lg">
						<p class="whitespace-pre-wrap text-lg font-normal md:pt-12">
							{translatedDescription}
						</p>
					</TabItem>
				{/if}
				{#if postItem && postItem.images.length > 0}
					<TabItem title={$t('travel.gallery-title')} defaultClass="text-lg">
						<Gallery
							images={postItem.images}
							showDateOnDetail={false}
							imageTransformation={DirectusImageTransformation.PREVIEW}
						/>
					</TabItem>
				{/if}
				{#if mapItems}
					<TabItem title={$t('common.map')} defaultClass="text-lg p-0">
						<Map items={mapItems} {countryCode} activatable />
					</TabItem>
				{/if}
			</Tabs>
		</div>

		<div class="hidden md:block">
			{#if translatedDescription}
				<p class="whitespace-pre-wrap pt-8 text-lg font-normal md:pt-12">
					{translatedDescription}
				</p>
			{/if}

			{#if postItem && postItem.images.length > 0}
				<Hr />
				<div class="m-2">
					<Gallery
						images={postItem.images}
						showDateOnDetail={false}
						imageTransformation={DirectusImageTransformation.PREVIEW}
					/>
				</div>
			{/if}

			{#if mapItems}
				<Hr />
				<Map items={mapItems} {countryCode} activatable />
			{/if}
		</div>
	</div>
</section>
