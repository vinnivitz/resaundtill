<script lang="ts">
	import { goto } from '$app/navigation';
	import Map from '$lib/components/Map.svelte';
	import Countdown from '$lib/components/countdown/Countdown.svelte';
	import { PagePath, type MapItem } from '$lib/models';
	import type { PageData } from './$types';

	export let data: PageData;

	$: showCountdown = (data.departure.getTime() - new Date().getTime()) / 1000 > 0;
	const mapItems: MapItem[] = data.posts
		.filter((post) => post.location)
		.map((post) => ({
			coords: post.location!.coordinates,
			isFlight: post.isFlight
		}));

	function navigate(event: CustomEvent) {
		const coordinates: number[] = event.detail;
		const matchedPost = data.posts.find(
			(post) =>
				post.location &&
				post.location.coordinates[0] === coordinates[1] &&
				post.location.coordinates[1] === coordinates[0]
		);

		if (matchedPost) {
			goto(`${PagePath.travel}/${matchedPost.id}`);
		}
	}
</script>

<Map items={mapItems} on:activeCoords={(event) => navigate(event)} />
{#if showCountdown}
	<div class="absolute left-[calc(50%-192.5px)] top-[calc(50%-95px)] z-50 md:left-[calc(50%-320px)]">
		<Countdown date={data.departure} />
	</div>
{/if}
