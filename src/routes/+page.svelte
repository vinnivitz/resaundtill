<script lang="ts">
	// import Map from '$lib/components/Map.svelte';
	import type { PageData } from './$types';
	import Countdown from '$lib/components/Countdown.svelte';

	// export let data: PageData;
	// export let coords = data.posts.map((post) => post.location!.coordinates).filter((post) => post);
</script>

<svelte:head><title>Resa und Till - Reiseblog</title></svelte:head>

<!-- <Map {coords} /> -->
<div class="absolute top-1/3 left-24 md:left-1/3">
		<Countdown from="2023-10-30 17:40:00" dateFormat="YYYY-MM-DD H:m:s" zone="Europe/Berlin" let:remaining>
			<div class="text-2xl md:text-4xl">
				<div><span class="text-4xl md:text-6xl text-blue-600">{remaining.months}</span> Monate</div>
				<div><span class="text-4xl md:text-6xl text-blue-600">{remaining.weeks}</span> Wochen</div>
				<div><span class="text-4xl md:text-6xl text-blue-600">{remaining.days}</span> Tage</div>
				<div><span class="text-4xl md:text-6xl text-blue-600">{remaining.hours}</span> Stunden</div>
				<div><span class="text-4xl md:text-6xl text-blue-600">{remaining.minutes}</span> Minuten</div>
				<div><span class="text-4xl md:text-6xl text-blue-600">{remaining.seconds}</span> Sekunden</div>
			</div>
		</Countdown>
</div>
