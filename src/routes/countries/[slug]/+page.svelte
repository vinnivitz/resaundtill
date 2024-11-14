<script lang="ts">
	// import { Heading, Secondary, Hr, Tabs, TabItem } from 'flowbite-svelte';
	// import { fly } from 'svelte/transition';
	// import { t, locale } from 'svelte-i18n';
	// // @ts-expect-error - Ignore this error
	// import FaMap from 'svelte-icons/fa/FaMap.svelte';
	// // @ts-expect-error - Ignore this error
	// import FaMoneyBillWave from 'svelte-icons/fa/FaMoneyBillWave.svelte';
	// // @ts-expect-error - Ignore this error
	// import FaUser from 'svelte-icons/fa/FaUser.svelte';

	// import BlogPosts from '$lib/components/BlogPosts.svelte';
	// import MapComponent from '$lib/components/Map.svelte';
	// import { PagePath, type CountryEntryTranslation, type CountryItemDetails } from '$lib/models';
	// import { dataStore } from '$lib/stores';
	// import { getTranslation } from '$lib/utils';

	// import { goto } from '$app/navigation';

	// import type { PageData } from './$types';

	// export let data: PageData;

	// const country = $dataStore.countries.get(data.countryId)!;

	// const countryItem: CountryItemDetails = {
	// 	code: country.code,
	// 	name: getCountryEntryPostTranslation(country.translations, $locale)!.name,
	// 	description: getCountryEntryPostTranslation(country.translations, $locale)!.description,
	// 	population: country.population,
	// 	area: country.area,
	// 	capital: country.capital,
	// 	currency: country.currency,
	// 	posts: data.posts.filter((post) => post.countryCode === country.code),
	// 	mapItems: data.posts
	// 		.filter((post) => post.location && post.countryCode === country.code)
	// 		.map((post) => {
	// 			return {
	// 				coords: post.location!.coordinates,
	// 				isFlight: post.isFlight
	// 			};
	// 		})
	// };

	// function getCountryEntryPostTranslation(
	// 	translations: CountryEntryTranslation[],
	// 	locale: string | null | undefined
	// ): CountryEntryTranslation | undefined {
	// 	return getTranslation<CountryEntryTranslation>(translations, locale);
	// }

	// function navigate(event: CustomEvent) {
	// 	const coordinates: number[] = event.detail;
	// 	const matchedPost = data.posts.find(
	// 		(post) =>
	// 			post.location &&
	// 			post.location.coordinates[0] === coordinates[1] &&
	// 			post.location.coordinates[1] === coordinates[0]
	// 	);

	// 	if (matchedPost) {
	// 		goto(`${PagePath.travel}/${matchedPost.id}`);
	// 	}
	// }
</script>

<section class="p-3 md:px-12 md:py-4">
	<!-- <div in:fly={{ y: 50, duration: 1000 }}>
		<Heading customSize="text-4xl md:text-5xl mt-5">
			<Secondary>
				<div class="flex gap-4">
					<span class={`fi fi-${countryItem.code}`}></span><span>{countryItem.name}</span>
				</div>
			</Secondary>
		</Heading> -->
	<!-- 
		<div class="hidden md:block">
			<Hr />
		</div>

		<div class="block md:hidden">
			<Tabs tabStyle="underline" defaultClass="flex justify-center">
				{#if countryItem.description}
					<TabItem open title={$t('common.information')} defaultClass="text-lg">
						<p class="whitespace-pre-wrap text-lg font-normal">
							{countryItem.description}
						</p>
					</TabItem>
				{/if}
				<TabItem title={$t('common.overview')} defaultClass="text-lg">
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
				{#if countryItem.posts.length > 0}
					<TabItem title={$t('common.posts')} defaultClass="text-lg">
						<BlogPosts posts={countryItem.posts} thumbnails={data.blogPostThumbnailMap} />
					</TabItem>
				{/if}
				<TabItem title={$t('common.map')} defaultClass="text-lg p-0">
					<MapComponent
						items={countryItem.mapItems}
						countryCode={countryItem.code}
						deactivated={true}
						on:activeCoords={(event) => navigate(event)}
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
					<div>{$t('common.population')}: {country?.population}</div>
				</div>
				<div class="mb-4 flex gap-2">
					<div class="h-6 w-6"><FaMap /></div>
					<div>{$t('common.area')}: {country?.area}m²</div>
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

			{#if countryItem.posts.length > 0}
				<Hr />
				<div class="m-2">
					<BlogPosts posts={countryItem.posts} thumbnails={data.blogPostThumbnailMap} />
				</div>
			{/if}

			<Hr />
			<MapComponent
				items={countryItem.mapItems}
				countryCode={countryItem.code}
				deactivated={true}
				on:activeCoords={(event) => navigate(event)}
			/>
		</div>
	</div> -->
</section>
