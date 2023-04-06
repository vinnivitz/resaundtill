<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	export let coords = data.posts.map((post) => post.location!.coordinates).filter((post) => post);

	
</script>

<svelte:head><title>Resa und Till - Reiseblog</title></svelte:head>

<Map {coords} />
