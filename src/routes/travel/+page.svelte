<script lang="ts">
	import BlogPosts from '$lib/components/BlogPosts.svelte';
	import { postsStore } from '$lib/stores';
</script>

<section class="p-4 pt-0 md:pt-4">
	<BlogPosts posts={$postsStore} searchable={true} />
</section>
