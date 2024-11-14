<script lang="ts">
	import BlogPosts from '$lib/components/BlogPosts.svelte';
	import Content from '$lib/components/calendar/Content.svelte';
	import { postsStore } from '$lib/stores';
</script>

<Content animate>
	<BlogPosts posts={$postsStore} searchable={true} />
</Content>
