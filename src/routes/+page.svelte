<script lang="ts">
	import Countdown from '$lib/components/countdown/Countdown.svelte';
	import Map from '$lib/components/Map.svelte';
	import { PagePath } from '$lib/models';
	import { departureStore, mapItemsStore } from '$lib/stores/data.store';

	import { goto } from '$app/navigation';
</script>

<Map items={$mapItemsStore} navigate={async (postId) => await goto(`${PagePath.travel}/${postId}`)} />
{#if ($departureStore?.getTime() ?? 0) > Date.now()}
	<div class="absolute inset-0 flex items-center justify-center">
		<Countdown date={$departureStore} />
	</div>
{/if}
