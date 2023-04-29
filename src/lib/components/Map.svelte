<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import { onMount } from 'svelte';

	export let coords: number[][];

	onMount(async () => {
		const L = await import('leaflet');

		const map = L.map('map').setView([coords[coords.length - 1][1], coords[coords.length - 1][0]], 13);
		map.zoomControl.remove();
		map.zoomOut(3);
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '© OpenStreetMap'
		}).addTo(map);

		const icon = L.icon({
			iconUrl: 'images/tillresa_marker.png',
			iconSize: [38, 95],
			shadowSize: [50, 64],
			iconAnchor: [22, 94],
			popupAnchor: [-3, -76]
		});

		const markers = coords.map((coord) => L.marker([coord[1], coord[0]], { icon }).addTo(map));
		if (markers.length > 1) {
			for (let i = 0; i < markers.length - 1; i++) {
				L.polyline([markers[i].getLatLng(), markers[i + 1].getLatLng()], { color: 'blue' }).addTo(map);
			}
		}
	});
</script>

<svelte:head />

<div id="map" />

<style>
	#map {
		height: calc(100vh - 5rem);
	}
</style>
