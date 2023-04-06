<script lang="ts">
	import type { PageData } from './$types';
	import BlogPosts from '$lib/components/BlogPosts.svelte';

	export let data: PageData;
</script>

<div class="_container pt-0 md:pt-8">
	{#if data.posts}
		<BlogPosts posts={data.posts} />
	{/if}
</div>

<style lang="postcss">
	._container {
		/* margin-top: 17rem; */
	}
</style>
