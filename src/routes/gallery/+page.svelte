<!-- <script lang="ts">
	import { Spinner } from 'flowbite-svelte';
	import { fly } from 'svelte/transition';

	import Gallery from '$lib/components/Gallery.svelte';

	import { browser } from '$app/environment';

	import type { PageData } from './$types';

	export let data: PageData;

	const images = [...data.files.map((file) => file.directus_files_id)].reverse();

	const galleryShufflePercentage = data.galleryShufflePercentage || 0;
	let isLoading = true;
</script>

{#if !browser || isLoading}
	<div class="absolute z-10 mt-[-100px] flex h-screen w-screen items-center justify-center">
		<Spinner size="24" color="blue" />
	</div>
{/if}
<section class="px-5 pb-5 pt-5 md:pb-16 md:pt-8" in:fly={{ y: 50, duration: 1000 }}>
	<Gallery
		posts={data.posts}
		showPostLink
		{images}
		caching={false}
		searchable
		randomizePercentage={galleryShufflePercentage}
		on:loading={(event) => (isLoading = event.detail)}
	/>
</section> -->
