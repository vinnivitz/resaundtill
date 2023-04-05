<script lang="ts">
	import type { PageData } from './$types';
	import BlogPosts from '$lib/components/BlogPosts.svelte';
	import Calendar from '$lib/components/Calendar.svelte';

	export let data: PageData;
</script>

<!-- <div class="w-full" style="max-width: 100vw">
	<Calendar />
</div> -->

{#if data.posts}
	<BlogPosts posts={data.posts} />
{/if}
