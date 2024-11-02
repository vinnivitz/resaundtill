<script lang="ts">
	import { Heading, Secondary, Hr } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import { fly } from 'svelte/transition';
	import { locale } from 'svelte-i18n';
	import MapComponent from '$lib/components/Map.svelte';
	import { getTranslation, isPointInPolygon } from '$lib/utils';
	import {
		PagePath,
		type BlogPostEntry,
		type CountryData,
		type CountryEntryTranslation,
		type GeoFeature,
		type GeoFeatureCollection,
		type MapItem
	} from '$lib/models';
	import { onMount } from 'svelte';
	import BlogPosts from '$lib/components/BlogPosts.svelte';
	import { goto } from '$app/navigation';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { t } from 'svelte-i18n';
	// @ts-expect-error - Ignore this error
	import FaUser from 'svelte-icons/fa/FaUser.svelte';
	// @ts-expect-error - Ignore this error
	import FaMap from 'svelte-icons/fa/FaMap.svelte';
	// @ts-expect-error - Ignore this error
	import FaMoneyBillWave from 'svelte-icons/fa/FaMoneyBillWave.svelte';

	export let data: PageData;

	let mapItems: MapItem[] = [];
	let countryCode: string | undefined;
	let posts: BlogPostEntry[] = [];
	let metaData: CountryData | undefined;

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
		return data.posts.filter(
			(post) => post?.location?.coordinates && isPointInPolygon(post.location.coordinates, polygon)
		);
	}

	onMount(async () => {
		const geojsonResult = await fetch('/json/countries.geojson');
		const collection: GeoFeatureCollection = await geojsonResult.json();
		const feature = collection.features.find(
			(feature) => feature.properties.ISO_A2.toLowerCase() === countryItem.code.toLowerCase()
		);
		if (feature) {
			countryCode = feature.properties.ISO_A2.toLowerCase();
			posts = getPosts(feature);
			mapItems = posts.map((post) => ({ coords: post.location?.coordinates, isFlight: post.isFlight }) as MapItem);
		}
		const countryDataResult = await fetch(`/json/country-data.json`);
		const countryData: CountryData[] = await countryDataResult.json();
		metaData = countryData.find((entry) => entry.cca2.toLowerCase() === countryItem.code.toLowerCase());
	});
</script>

<section class="p-3 md:px-12 md:py-4">
	<div in:fly={{ y: 50, duration: 1000 }}>
		<Heading customSize="text-4xl md:text-5xl mt-5">
			<Secondary>
				<div class="flex gap-4">
					<span class={`fi fi-${countryItem.code.toLowerCase()}`}></span><span>{translatedName}</span>
				</div>
			</Secondary>
		</Heading>

		<div class="hidden md:block">
			<Hr />
		</div>

		<div class="block md:hidden">
			<Tabs tabStyle="underline" defaultClass="flex justify-center">
				{#if translatedDescription}
					<TabItem open title={$t('common.information')} defaultClass="text-lg">
						<p class="whitespace-pre-wrap text-lg font-normal">
							{translatedDescription}
						</p>
					</TabItem>
				{/if}
				<TabItem title={$t('common.overview')} defaultClass="text-lg">
					<div class="mb-4 flex gap-2">
						<div class="h-6 w-6"><FaUser /></div>
						<div>{$t('common.population')}: {metaData?.population}</div>
					</div>
					<div class="mb-4 flex gap-2">
						<div class="h-6 w-6"><FaMap /></div>
						<div>{$t('common.area')}: {metaData?.area}m²</div>
					</div>
					<div class="mb-4 flex gap-2">
						<div class="h-6 w-6"><FaMoneyBillWave /></div>
						<div>
							{$t('common.currency')}: {metaData
								? Object.values(metaData.currencies).map((currency) => currency.name)
								: ''}
						</div>
					</div>
					<div class="mb-4 flex gap-2">
						<div class="h-6 w-6"><FaUser /></div>
						<div>{$t('common.capital')}: {metaData?.capital.join(', ')}</div>
					</div>
				</TabItem>
				{#if posts.length > 0}
					<TabItem title={$t('common.posts')} defaultClass="text-lg">
						<BlogPosts {posts} thumbnails={data.blogPostThumbnailMap} />
					</TabItem>
				{/if}
				{#if countryCode}
					<TabItem title={$t('common.map')} defaultClass="text-lg p-0">
						<MapComponent
							items={mapItems}
							{countryCode}
							deactivated={true}
							on:activeCoords={(event) => navigate(event)}
						/>
					</TabItem>
				{/if}
			</Tabs>
		</div>

		<div class="hidden md:block">
			<p class="whitespace-pre-wrap pb-4 text-lg font-normal">
				{translatedDescription}
			</p>

			<Hr />

			<div class="flex gap-5 justify-between">
				<div class="mb-4 flex gap-2">
					<div class="h-6 w-6"><FaUser /></div>
					<div>{$t('common.population')}: {metaData?.population}</div>
				</div>
				<div class="mb-4 flex gap-2">
					<div class="h-6 w-6"><FaMap /></div>
					<div>{$t('common.area')}: {metaData?.area}m²</div>
				</div>
				<div class="mb-4 flex gap-2">
					<div class="h-6 w-6"><FaMoneyBillWave /></div>
					<div>
						{$t('common.currency')}: {metaData
							? Object.values(metaData.currencies).map((currency) => currency.name)
							: ''}
					</div>
				</div>
				<div class="mb-4 flex gap-2">
					<div class="h-6 w-6"><FaUser /></div>
					<div>{$t('common.capital')}: {metaData?.capital.join(', ')}</div>
				</div>
			</div>

			{#if posts.length > 0}
				<Hr />
				<div class="m-2">
					<BlogPosts {posts} thumbnails={data.blogPostThumbnailMap} />
				</div>
			{/if}

			{#if countryCode}
				<Hr />
				<MapComponent items={mapItems} {countryCode} deactivated={true} on:activeCoords={(event) => navigate(event)} />
			{/if}
		</div>
	</div>
</section>
