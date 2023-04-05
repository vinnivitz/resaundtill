<script>
	import Map from '@anoram/leaflet-svelte';

	const options = {
		controls: { zoomControl: false },
		center: [13, 80],
		markers: [
			{
				lat: 13,
				lng: 80
			},
			{
				lat: 14,
				lng: 80
			},
			{
				lat: 15,
				lng: 80
			}
		],
		mapID: 'map'
	};
</script>

<div class="map">
	<Map {options} />
</div>

<style>
	.map {
		height: calc(100vh - 4rem);
		margin: auto;
	}
</style>
