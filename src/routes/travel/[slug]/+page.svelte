<script lang="ts">
	import { Heading, Secondary, Hr } from 'flowbite-svelte';
	import type { PageData } from './$types';
	// @ts-expect-error - Ignore this error
	import FaCalendar from 'svelte-icons/fa/FaCalendar.svelte';
	import { fly } from 'svelte/transition';
	import { _, locale } from 'svelte-i18n';
	import Gallery from '$lib/components/Gallery.svelte';
	// @ts-expect-error - Ignore this error
	import FaArrowLeft from 'svelte-icons/fa/FaArrowLeft.svelte';
	// @ts-expect-error - Ignore this error
	import FaArrowRight from 'svelte-icons/fa/FaArrowRight.svelte';
	// @ts-expect-error - Ignore this error
	import FaInfoCircle from 'svelte-icons/fa/FaInfoCircle.svelte';
	// @ts-expect-error - Ignore this error
	import FaImages from 'svelte-icons/fa/FaImages.svelte';
	// @ts-expect-error - Ignore this error
	import FaMapMarkerAlt from 'svelte-icons/fa/FaMapMarkerAlt.svelte';
	import Map from '$lib/components/Map.svelte';
	import { formatDate, getTranslation } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { PagePath, type BlogPostTranslation, type DirectusImage, type MapItem } from '$lib/models';
	import { Tabs, TabItem } from 'flowbite-svelte';

	export let data: PageData;

	const postItem = data.posts.find((post) => post.id === data.postID)!;

	let currentIndex = data.posts.findIndex((post) => post.id === postItem.id);
	$: isPrevPost = currentIndex > 0;
	$: isNextPost = currentIndex < data.posts.length - 1;

	$: translatedTitle = getBlogPostTranslation(postItem.translations, $locale)?.title;
	$: translatedDescription = getBlogPostTranslation(postItem.translations, $locale)?.description;

	const images: DirectusImage[] =
		postItem.images
			?.sort(
				(a, b) =>
					new Date(a.directus_files_id.uploaded_on).getTime() - new Date(b.directus_files_id.uploaded_on).getTime()
			)
			.map(
				(image) =>
					({
						id: image.directus_files_id.id,
						title: image.directus_files_id.title,
						description: image.directus_files_id.description,
						width: image.directus_files_id.width,
						height: image.directus_files_id.height,
						uploaded_on: image.directus_files_id.uploaded_on
					}) as DirectusImage
			) || [];

	const mapItems = Array.isArray(postItem.location?.coordinates)
		? ([
				{
					coords: [postItem.location!.coordinates[0], postItem.location!.coordinates[1]] as number[],
					isFlight: postItem.isFlight
				}
			] as MapItem[])
		: null;

	function getPrevPost(): void {
		const index = data.posts.findIndex((post) => post.id === postItem.id);
		if (index > 0) {
			goto(`${PagePath.travel}/${data.posts[index - 1].id}`);
		}
	}

	function getNextPost(): void {
		const index = data.posts.findIndex((post) => post.id === postItem.id);
		if (index < data.posts.length - 1) {
			goto(`${PagePath.travel}/${data.posts[index + 1].id}`);
		}
	}

	function getBlogPostTranslation(
		translations: BlogPostTranslation[],
		locale: string | null | undefined
	): BlogPostTranslation | undefined {
		return getTranslation<BlogPostTranslation>(translations, locale);
	}
</script>

<section class="p-3 md:px-12 md:py-4">
	<div class="mb-3 flex">
		<button
			on:click={getPrevPost}
			disabled={!isPrevPost}
			class:opacity-0={!isPrevPost}
			class="flex rounded-full bg-gray-200 px-4 pt-2 align-middle text-sm font-bold leading-6 text-gray-800 hover:bg-gray-400"
		>
			<div class="h-5 w-5"><FaArrowLeft /></div>
			<div class="pl-2">{$_('travel.header.prev-button.label')}</div>
		</button>
		<div class="grow" />
		<button
			on:click={getNextPost}
			disabled={!isNextPost}
			class:opacity-0={!isNextPost}
			class="flex rounded-full bg-gray-200 px-4 py-2 align-middle text-sm font-bold leading-6 text-gray-800 hover:bg-gray-400"
		>
			<div class="pr-2">{$_('travel.header.next-button.label')}</div>
			<div class="h-6 w-6"><FaArrowRight /></div>
		</button>
	</div>

	<div in:fly={{ y: 50, duration: 1000 }}>
		<Heading customSize="text-4xl md:text-5xl mt-6">
			<Secondary>{translatedTitle}</Secondary>
		</Heading>
		<Hr />

		<div class="flex flex-wrap items-center gap-4">
			<div class="hidden grow md:block" />
			<div class="h-6 w-6"><FaCalendar /></div>
			<div class="text-sm md:text-lg">{formatDate(new Date(postItem.date), $locale)}</div>
		</div>

		<div class="mt-7 block md:hidden">
			<Tabs tabStyle="underline" defaultClass="flex justify-center">
				{#if translatedDescription}
					<TabItem open title={$_('travel.description')} defaultClass="text-lg">
						<p class="whitespace-pre-wrap text-lg font-normal md:pt-12">
							{translatedDescription}
						</p>
					</TabItem>
				{/if}
				{#if images.length > 0}
					<TabItem title={$_('travel.gallery-title')} defaultClass="text-lg">
						<Gallery {images} posts={data.posts} />
					</TabItem>
				{/if}
				{#if mapItems}
					<TabItem title={$_('common.map')} defaultClass="text-lg p-0">
						<Map items={mapItems} deactivated={true} />
					</TabItem>
				{/if}
			</Tabs>
		</div>
		<div class="hidden md:block">
			<p class="whitespace-pre-wrap pt-8 text-lg font-normal md:pt-12">
				{translatedDescription}
			</p>

			{#if images.length > 0}
				<Hr />
				<div class="m-2">
					<Gallery {images} posts={data.posts} />
				</div>
			{/if}

			{#if mapItems}
				<Hr />	
				<Map items={mapItems} deactivated={true} />
			{/if}
		</div>
	</div>
</section>
