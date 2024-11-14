<script lang="ts">
	// import dayjs from 'dayjs';
	// import { Heading, Secondary, Hr, Tabs, TabItem } from 'flowbite-svelte';
	// import { fly } from 'svelte/transition';
	// import { t, locale } from 'svelte-i18n';
	// // @ts-expect-error - no types available
	// import FaArrowLeft from 'svelte-icons/fa/FaArrowLeft.svelte';
	// // @ts-expect-error - no types available
	// import FaArrowRight from 'svelte-icons/fa/FaArrowRight.svelte';
	// // @ts-expect-error - no types available
	// import FaCalendar from 'svelte-icons/fa/FaCalendar.svelte';

	// import Gallery from '$lib/components/Gallery.svelte';
	// import Map from '$lib/components/Map.svelte';
	// import {
	// 	PagePath,
	// 	type BlogPostItemDetails,
	// 	type BlogPostTranslation,
	// 	type CountryEntryTranslation,
	// 	type DirectusImageDetails,
	// 	type MapItem
	// } from '$lib/models';
	// import { dataStore } from '$lib/stores';
	// import { formatDate, getTranslation } from '$lib/utils';

	// import { goto } from '$app/navigation';

	// import type { PageData } from './$types';

	// let data: PageData;

	// let currentIndex: number;
	// let postItem: BlogPostItemDetails;
	// let countryName: string | undefined;
	// let countryCode: string;
	// let isPrevPost = false;
	// let isNextPost = false;
	// let mapItems: MapItem[];

	// $: if ($dataStore?.posts && $dataStore) {
	// 	const posts = $dataStore.posts;
	// 	const post = posts.find((post) => post.id === data.postID);
	// 	if (!post) {
	// 		goto(PagePath.travel);
	// 	} else {
	// 		postItem = {
	// 			id: post.id,
	// 			date: new Date(post.date),
	// 			translations: post.translations,
	// 			formattedDate: { day: dayjs(post.date).format('DD'), month: dayjs(post.date).format('MMMM') },
	// 			images: []
	// 		};

	// 		currentIndex = posts.findIndex((post) => post.id === postItem.id);
	// 		isPrevPost = currentIndex > 0;
	// 		isNextPost = currentIndex < $dataStore.posts.length - 1;

	// 		if ($dataStore.postToCountry) {
	// 			const countryCode = $dataStore.postToCountry.get(postItem.id);
	// 			if (countryCode) {
	// 				countryName = getTranslation<CountryEntryTranslation>(
	// 					$dataStore.countries.find((country) => country.code === countryCode)?.translations ?? [],
	// 					$locale
	// 				)?.name;

	// 				if ($dataStore.mapItems && $dataStore.countryToPosts) {
	// 					mapItems = $dataStore.mapItems.filter((item) =>
	// 						$dataStore.countryToPosts.get(countryCode)?.includes(item.id)
	// 					);
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	// $: translatedTitle = getTranslation<BlogPostTranslation>(postItem.translations, $locale)?.title;

	// $: translatedDescription = getTranslation<BlogPostTranslation>(postItem.translations, $locale)?.description;

	// const images: DirectusImageDetails[] = [];

	// function getPrevPost(): void {
	// 	if (isPrevPost && $dataStore.posts) {
	// 		const post = $dataStore.posts[currentIndex - 1];
	// 		goto(`${PagePath.travel}/${post.id}`);
	// 	}
	// }

	// function getNextPost(): void {
	// 	if (isNextPost && $dataStore.posts) {
	// 		const post = $dataStore.posts[currentIndex + 1];
	// 		goto(`${PagePath.travel}/${post.id}`);
	// 	}
	// }
</script>
<!-- 
<section class="p-3 md:px-12 md:py-4">
	<div class="mb-3 mt-2 flex md:mt-0">
		{#if isPrevPost}
			<button
				on:click={getPrevPost}
				class="flex rounded-full bg-gray-200 px-4 pt-2 align-middle text-sm font-bold leading-6 text-gray-800 hover:bg-gray-400"
			>
				<div class="h-5 w-5"><FaArrowLeft /></div>
				<div class="pl-2">{$t('travel.header.prev-button.label')}</div>
			</button>
		{:else}
			<div class="invisible flex rounded-full px-4 pt-2"></div>
		{/if}
		<div class="grow"></div>
		{#if isNextPost}
			<button
				on:click={getNextPost}
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
		<Heading customSize="text-4xl md:text-5xl mt-6 md:mt-6">
			<Secondary>{translatedTitle}</Secondary>
		</Heading>
		<Hr />

		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<div class="h-6 w-6"><FaCalendar /></div>
				<div class="pt-1 text-sm md:text-lg">
					{formatDate(new Date(postItem.date), $locale)}
				</div>
			</div>
			{#if countryCode}
				<div class="flex items-center gap-2 text-xl">
					<div class={`fi fi-${countryCode}`}></div>
					<div>{countryName}</div>
				</div>
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
				{#if images.length > 0}
					<TabItem title={$t('travel.gallery-title')} defaultClass="text-lg">
						<Gallery {images} posts={data.posts} />
					</TabItem>
				{/if}
				{#if mapItems}
					<TabItem title={$t('common.map')} defaultClass="text-lg p-0">
						<Map items={mapItems} deactivated={true} />
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

			{#if images.length > 0}
				<Hr />
				<div class="m-2">
					<Gallery {images} posts={$dataStore?.posts} />
				</div>
			{/if}

			{#if mapItems}
				<Hr />
				<Map items={mapItems} deactivated={true} />
			{/if}
		</div>
	</div>
</section> -->
