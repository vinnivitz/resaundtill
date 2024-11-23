<script lang="ts">
	import Map from '$lib/components/Map.svelte';
	import { PagePath } from '$lib/models';
	import { mapItemsStore } from '$lib/stores';

	import { goto } from '$app/navigation';
</script>

<Map items={$mapItemsStore} navigate={async (postId) => await goto(`${PagePath.travel}/${postId}`)} />
