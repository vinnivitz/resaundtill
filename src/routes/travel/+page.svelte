<script lang="ts">
	import BlogPosts from '$lib/components/BlogPosts.svelte';
	import { fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import { dataStore } from '$lib/stores/data.store';
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="pt-4 md:pt-12">
	<BlogPosts posts={$dataStore?.posts} searchable />
</section>
