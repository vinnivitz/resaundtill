<script lang="ts">
	import { goto } from '$app/navigation';
	import Map from '$lib/components/Map.svelte';
	import Countdown from '$lib/components/countdown/Countdown.svelte';
	import { PagePath } from '$lib/models';
	import { dataStore } from '$lib/stores/data.store';

	let showCountdown = false;

	$: if ($dataStore?.departure) {
		showCountdown = ($dataStore.departure.getTime() - new Date().getTime()) / 1000 > 0;
	}
</script>

<Map items={$dataStore?.mapItems ?? []} on:navigate={(event) => goto(`${PagePath.travel}/${event.detail}`)} />
{#if showCountdown}
	<div class="absolute left-[calc(50%-192.5px)] top-[calc(50%-95px)] z-50 md:left-[calc(50%-320px)]">
		<Countdown date={$dataStore?.departure} />
	</div>
{/if}
