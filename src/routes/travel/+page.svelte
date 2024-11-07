<script lang="ts">
	import type { PageData } from './$types';
	import BlogPosts from '$lib/components/BlogPosts.svelte';
	import { fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';

	export let data: PageData;

	const posts = [...data.posts].reverse();
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="pt-4 md:pt-12">
	{#if data.posts}
		<BlogPosts
			{posts}
			countries={Array.from(data.countries.values())}
			thumbnails={data.blogPostThumbnailMap}
			searchable
		/>
	{:else}
		<div class="text-center">
			{$_('travel.no-entries')}
		</div>
	{/if}
</section>
