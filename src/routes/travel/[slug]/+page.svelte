<script lang="ts">
	import { Heading, Secondary, Hr } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import FaCalendar from 'svelte-icons/fa/FaCalendar.svelte';
	import { fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import Gallery from '$lib/components/Gallery.svelte';
	import { formatDate } from '$lib/utils/format-date.util';
	import type { DirectusImage } from '$lib/sdk/types';
	import FaArrowLeft from 'svelte-icons/fa/FaArrowLeft.svelte';
	import FaArrowRight from 'svelte-icons/fa/FaArrowRight.svelte';
	import Map from '$lib/components/Map.svelte';

	export let data: PageData;

	const files: DirectusImage[] =
		data.post.images?.map(
			(image) =>
				({
					id: image.directus_files_id.id,
					title: image.directus_files_id.title,
					description: image.directus_files_id.description
				} as DirectusImage)
		) || [];

	const coords = Array.isArray(data.post.location?.coordinates)
		? [[data.post.location!.coordinates[0], data.post.location!.coordinates[1]]]
		: null;
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="p-3 md:px-12 md:py-4">
	<!-- <div class="flex mb-3">
		<button
			on:click={} class="flex bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold pt-2 px-4 rounded-full text-sm leading-6 align-middle"
		>
			<div class="w-5 h-5"><FaArrowLeft /></div>
			<div class="pl-2">{$_('travel.header.prev-button.label')}</div>
		</button>
		<div class="grow" />
		<button
			class="flex bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full text-sm leading-6 align-middle"
		>
			<div class="pr-2">{$_('travel.header.next-button.label')}</div>
			<div class="w-6 h-6"><FaArrowRight /></div>
		</button>
	</div> -->

	<Heading customSize="text-4xl md:text-5xl"><Secondary>{data.post.title}</Secondary></Heading>
	<Hr />

	<div class="flex flex-wrap gap-4 items-center">
		<div class="grow" />
		<div class="w-6 h-6"><FaCalendar /></div>
		<div class="text-sm md:text-lg">{formatDate(new Date(data.post.date))}</div>
	</div>
	<p class="pt-8 md:pt-12 text-lg">
		{data.post.description ?? ''}
	</p>

	<Hr />

	<Heading customSize="pt-5 pb-3 text-4xl"><Secondary>{$_('travel.gallery-title')}</Secondary></Heading>

	<div class="m-2">
		<Gallery {files} />
	</div>

	{#if coords}
		<Hr />

		<Heading customSize="pt-5 pb-3 text-4xl"><Secondary>{$_('common.map')}</Secondary></Heading>

		<Map {coords} disableZoom={true} />
	{/if}
</section>
