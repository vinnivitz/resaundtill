<script lang="ts">
	import { goto } from '$app/navigation';
	import Map from '$lib/components/Map.svelte';
	import Countdown from '$lib/components/countdown/Countdown.svelte';
	import { PagePath, type MapItem } from '$lib/models';
	import type { PageData } from './$types';

	export let data: PageData;

	const mapItems: MapItem[] = [];

	for (const post of data.posts) {
		if (post.location) {
			mapItems.push({
				coords: post.location.coordinates,
				isFlight: post.isFlight
			});
		}
	}

	const navigate = (event: CustomEvent) => {
		const coordindates = event.detail;
		const id = data.posts.find(
			(post) => post.location!.coordinates[0] === coordindates[1] && post.location!.coordinates[1] === coordindates[0]
		)?.id;
		goto(`${PagePath.travel}/${id}`);
	};

	const showCountdown = () => (data.departure.getTime() - new Date().getTime()) / 1000 > 0;
</script>

<Map items={mapItems} on:activeCoords={(event) => navigate(event)} />
{#if showCountdown()}
	<div class="absolute z-50 top-[calc(50%-95px)] left-[calc(50%-192.5px)] md:left-[calc(50%-320px)]">
		<Countdown date={data.departure} />
	</div>
{/if}
