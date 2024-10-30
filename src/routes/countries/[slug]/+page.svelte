<script lang="ts">
	import { Heading, Secondary, Hr } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import { fly } from 'svelte/transition';
	import { t, locale } from 'svelte-i18n';
	import Map from '$lib/components/Map.svelte';
	import { getTranslation } from '$lib/utils';
	import {
	PagePath,
		type BlogPostEntry,
		type CountryEntryTranslation,
		type GeoFeatureCollection,
		type MapItem
	} from '$lib/models';
	import { onMount } from 'svelte';
	import BlogPosts from '$lib/components/BlogPosts.svelte';
	import { goto } from '$app/navigation';

	export let data: PageData;

	let mapItems: MapItem[] = [];
	let countryCode: string | undefined;
	let posts: BlogPostEntry[] = [];

	$: translatedName = getCountryEntryTranslation(countryItem.translations, $locale)?.name;
	$: translatedDescription = getCountryEntryTranslation(countryItem.translations, $locale)?.description;

	const countryItem = data.countries.find((country) => country.id === data.countryId)!;

	function getCountryEntryTranslation(
		translations: CountryEntryTranslation[],
		locale: string | null | undefined
	): CountryEntryTranslation | undefined {
		return getTranslation<CountryEntryTranslation>(translations, locale);
	}

	function navigate(event: CustomEvent) {
		const coordinates: number[] = event.detail;
		const matchedPost = data.posts.find(
			(post) =>
				post.location &&
				post.location.coordinates[0] === coordinates[1] &&
				post.location.coordinates[1] === coordinates[0]
		);

		if (matchedPost) {
			goto(`${PagePath.travel}/${matchedPost.id}`);
		}
	}	

	onMount(async () => {
		const result = await fetch('/json/countries.geojson');
		const geojson: GeoFeatureCollection = await result.json();
		countryCode = geojson.features
			.find((feature) => feature.properties.ISO_A2.toLowerCase() === countryItem.code.toLocaleLowerCase())
			?.properties.ISO_A2.toLowerCase();
		const postIds = countryItem.entries.map((entry) => entry.resaundtill_posts_id);
		posts = data.posts.filter((post) => postIds.includes(post.id));
		mapItems = posts.map((post) => ({ coords: post.location?.coordinates, isFlight: post.isFlight }) as MapItem);
		console.log('map', mapItems);
	});
</script>

<section class="p-3 md:px-12 md:py-4">
	<div in:fly={{ y: 50, duration: 1000 }}>
		<Heading customSize="text-4xl md:text-5xl">
			<Secondary>
				<div class="flex gap-4">
					<span class={`fi fi-${countryItem.code.toLowerCase()}`}></span><span>{translatedName}</span>
				</div>
			</Secondary>
		</Heading>
		<Hr />
		<p class="whitespace-pre-wrap pt-4 text-lg font-normal md:pt-4">
			{translatedDescription}
		</p>

		{#if countryItem.entries.length > 0}
			<Hr />

			<Heading customSize="pt-5 pb-3 text-4xl"><Secondary>{$t('countries.posts')}</Secondary></Heading>

			<div class="m-2">
				<BlogPosts {posts} thumbnails={data.blogPostThumbnailMap} />
			</div>
		{/if}

		{#if countryCode}
			<Hr />

			<Heading customSize="pt-5 pb-3 text-4xl"><Secondary>{$t('common.map')}</Secondary></Heading>

			<Map items={mapItems} {countryCode} deactivated={true} on:activeCoords={(event) => navigate(event)} />
		{/if}
	</div>
</section>
