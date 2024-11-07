<script lang="ts">
	import { Heading, Secondary, Hr } from 'flowbite-svelte';
	import type { PageData } from './$types';
	// @ts-expect-error - no types available
	import FaCalendar from 'svelte-icons/fa/FaCalendar.svelte';
	import { fly } from 'svelte/transition';
	import { t, locale } from 'svelte-i18n';
	import Gallery from '$lib/components/Gallery.svelte';
	// @ts-expect-error - no types available
	import FaArrowLeft from 'svelte-icons/fa/FaArrowLeft.svelte';
	// @ts-expect-error - no types available
	import FaArrowRight from 'svelte-icons/fa/FaArrowRight.svelte';
	import Map from '$lib/components/Map.svelte';
	import { formatDate, getTranslation } from '$lib/utils';
	import { goto } from '$app/navigation';
	import {
		PagePath,
		type BlogPostTranslation,
		type CountryEntryTranslation,
		type DirectusImage,
		type MapItem
	} from '$lib/models';
	import { Tabs, TabItem } from 'flowbite-svelte';

	export let data: PageData;

	const postItem = data.posts.find((post) => post.id === data.postID)!;
	const countryName = getTranslation<CountryEntryTranslation>(
		Array.from(data.countries.values()).find((country) => country.code === postItem.countryCode)!.translations,
		$locale
	)?.name;
	const currentIndex = data.posts.findIndex((post) => post.id === postItem.id);
	const isPrevPost = currentIndex > 0;
	const isNextPost = currentIndex < data.posts.length - 1;

	$: translatedTitle = getTranslation<BlogPostTranslation>(postItem.translations, $locale)?.title;

	$: translatedDescription = getTranslation<BlogPostTranslation>(postItem.translations, $locale)?.description;

	const images: DirectusImage[] =
		postItem.images
			?.sort(
				(a, b) =>
					new Date(a.directus_files_id.uploaded_on).getTime() - new Date(b.directus_files_id.uploaded_on).getTime()
			)
			.map(({ directus_files_id: { id, title, description, width, height, uploaded_on } }) => ({
				id,
				title,
				description,
				width,
				height,
				uploaded_on
			})) || [];

	const mapItems: MapItem[] | null = postItem.location?.coordinates
		? [
				{
					coords: [...postItem.location.coordinates],
					isFlight: postItem.isFlight
				}
			]
		: null;

	function getPrevPost(): void {
		if (isPrevPost) {
			const post = data.posts[currentIndex - 1];
			goto(`${PagePath.travel}/${post.id}`);
		}
	}

	function getNextPost(): void {
		if (isNextPost) {
			const post = data.posts[currentIndex + 1];
			goto(`${PagePath.travel}/${post.id}`);
		}
	}
</script>

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
		<div class="grow" />
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
			{#if postItem.countryCode}
				<div class="flex items-center gap-2 text-xl">
					<div class={`fi fi-${postItem.countryCode}`}></div>
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
						<Map countryCode={postItem.countryCode} items={mapItems} deactivated={true} />
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
					<Gallery {images} posts={data.posts} />
				</div>
			{/if}

			{#if mapItems}
				<Hr />
				<Map countryCode={postItem.countryCode} items={mapItems} deactivated={true} />
			{/if}
		</div>
	</div>
</section>
