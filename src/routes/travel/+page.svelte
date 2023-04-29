<script lang="ts">
	import type { PageData } from './$types';
	import BlogPosts from '$lib/components/BlogPosts.svelte';
	import { fly } from 'svelte/transition';

	export let data: PageData;
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="relative z-50 pt-4 md:pt-12 z-50">
	{#if data.posts}
		<BlogPosts posts={data.posts} />
	{/if}
</section>
