<script lang="ts">
	import { Heading, Secondary, Hr } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import { fly } from 'svelte/transition';
	import { t, locale } from 'svelte-i18n';
	import MapComponent from '$lib/components/Map.svelte';
	import { getTranslation, isPointInPolygon } from '$lib/utils';
	import {
		PagePath,
		type BlogPostEntry,
		type CountryEntryTranslation,
		type GeoFeature,
		type GeoFeatureCollection,
		type GeoPoint,
		type MapItem
	} from '$lib/models';
	import { onMount } from 'svelte';
	import BlogPosts from '$lib/components/BlogPosts.svelte';
	import { goto } from '$app/navigation';
	import type { polygon } from 'leaflet';

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

	function getPosts(feature: GeoFeature): BlogPostEntry[] {
		const polygon = feature.geometry.coordinates;
		return data.posts.filter((post) => post?.location?.coordinates && isPointInPolygon(post.location.coordinates, polygon));
	}

	onMount(async () => {
		const result = await fetch('/json/countries.geojson');
		const collection: GeoFeatureCollection = await result.json();
		const feature = collection.features.find(
			(feature) => feature.properties.ISO_A2.toLowerCase() === countryItem.code.toLowerCase()
		);
		if (feature) {
			countryCode = feature.properties.ISO_A2.toLowerCase();
			posts = getPosts(feature);
			mapItems = posts.map((post) => ({ coords: post.location?.coordinates, isFlight: post.isFlight }) as MapItem);
		}
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

		{#if posts.length > 0}
			<Hr />

			<Heading customSize="pt-5 pb-3 text-4xl"><Secondary>{$t('countries.posts')}</Secondary></Heading>

			<div class="m-2">
				<BlogPosts {posts} thumbnails={data.blogPostThumbnailMap} />
			</div>
		{/if}

		{#if countryCode}
			<Hr />

			<Heading customSize="pt-5 pb-3 text-4xl"><Secondary>{$t('common.map')}</Secondary></Heading>

			<MapComponent items={mapItems} {countryCode} deactivated={true} on:activeCoords={(event) => navigate(event)} />
		{/if}
	</div>
</section>
