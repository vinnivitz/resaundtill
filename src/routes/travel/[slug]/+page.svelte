<script lang="ts">
	import { Heading, Secondary, Hr } from 'flowbite-svelte';
	import type { PageData } from './$types';
	// @ts-ignore
	import FaCalendar from 'svelte-icons/fa/FaCalendar.svelte';
	import { fly } from 'svelte/transition';
	import { _, locale } from 'svelte-i18n';
	import Gallery from '$lib/components/Gallery.svelte';
	import { formatDate } from '$lib/utils/format-date.util';
	import type { DirectusImage } from '$lib/sdk/types';
	// @ts-ignore
	import FaArrowLeft from 'svelte-icons/fa/FaArrowLeft.svelte';
	// @ts-ignore
	import FaArrowRight from 'svelte-icons/fa/FaArrowRight.svelte';
	import Map from '$lib/components/Map.svelte';
	import { getTranslationIdx } from '$lib/utils/get-translation-idx.util';

	export let data: PageData;

	const isPrevPost = () => data.posts.findIndex((post) => post.id === data.post.id) > 0;
	const isNextPost = () => data.posts.findIndex((post) => post.id === data.post.id) < data.posts.length - 1;

	const files: DirectusImage[] =
		data.post.images?.map(
			(image) =>
				({
					id: (image.directus_files_id as DirectusImage).id,
					title: (image.directus_files_id as DirectusImage).title,
					description: (image.directus_files_id as DirectusImage).description,
					width: (image.directus_files_id as DirectusImage).width,
					height: (image.directus_files_id as DirectusImage).height
				} as DirectusImage)
		) || [];

	const coords = Array.isArray(data.post.location?.coordinates)
		? [[data.post.location!.coordinates[0], data.post.location!.coordinates[1]]]
		: null;

	const getPrevPost = () => {
		const index = data.posts.findIndex((post) => post.id === data.post.id);
		if (index > 0) {
			window.location.href = `/travel/${data.posts[index - 1].id}`;
		}
	};

	const getNextPost = () => {
		const index = data.posts.findIndex((post) => post.id === data.post.id);
		if (index < data.posts.length - 1) {
			window.location.href = `/travel/${data.posts[index + 1].id}`;
		}
	};
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="p-3 md:px-12 md:py-4">
	<div class="flex mb-3">
		<button
			on:click={getPrevPost}
			disabled={!isPrevPost()}
			class:opacity-0={!isPrevPost()}
			class="flex bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold pt-2 px-4 rounded-full text-sm leading-6 align-middle"
		>
			<div class="w-5 h-5"><FaArrowLeft /></div>
			<div class="pl-2">{$_('travel.header.prev-button.label')}</div>
		</button>
		<div class="grow" />
		<button
			on:click={getNextPost}
			disabled={!isNextPost()}
			class:opacity-0={!isNextPost()}
			class="flex bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full text-sm leading-6 align-middle"
		>
			<div class="pr-2">{$_('travel.header.next-button.label')}</div>
			<div class="w-6 h-6"><FaArrowRight /></div>
		</button>
	</div>

	<Heading customSize="text-4xl md:text-5xl"
		><Secondary>{data.post.translations[getTranslationIdx($locale)].title}</Secondary></Heading
	>
	<Hr />

	<div class="flex flex-wrap gap-4 items-center">
		<div class="grow" />
		<div class="w-6 h-6"><FaCalendar /></div>
		<div class="text-sm md:text-lg">{formatDate(new Date(data.post.date), $locale)}</div>
	</div>
	<p class="pt-8 md:pt-12 text-lg font-normal">
		{data.post.translations[getTranslationIdx($locale)].description}
	</p>

	{#if files.length > 0}
		<Hr />

		<Heading customSize="pt-5 pb-3 text-4xl"><Secondary>{$_('travel.gallery-title')}</Secondary></Heading>

		<div class="m-2">
			<Gallery {files} />
		</div>
	{/if}

	{#if coords}
		<Hr />

		<Heading customSize="pt-5 pb-3 text-4xl"><Secondary>{$_('common.map')}</Secondary></Heading>

		<Map {coords} deactivated={true} />
	{/if}
</section>
