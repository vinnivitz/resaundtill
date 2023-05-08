<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import type { Map } from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	export let coords: number[][];
	export let zoomOut = 3;
	export let deactivated = false;

	const isActivatable = deactivated;

	const dispatch = createEventDispatcher();

	let map: Map;

	onMount(async () => {
		const L = await import('leaflet');

		if (coords.length < 1 || coords[0].length !== 2) {
			coords = [[51.053719, 13.737908]];
		}

		map = L.map('map').setView([coords[coords.length - 1][1], coords[coords.length - 1][0]], 13);
		map.zoomControl.remove();
		if (deactivated) {
			map.touchZoom.disable();
			map.doubleClickZoom.disable();
			map.scrollWheelZoom.disable();
			map.keyboard.disable();
			map.dragging.disable();
		}
		map.zoomOut(zoomOut);
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '© OpenStreetMap'
		}).addTo(map);

		const icon = L.icon({
			iconUrl: '/images/tillresa_marker.png',
			iconSize: [38, 95],
			shadowSize: [50, 64],
			iconAnchor: [22, 94],
			popupAnchor: [-3, -76]
		});

		const onClick = (e: any) => dispatch('activeCoords', [e.latlng.lat, e.latlng.lng]);

		const markers = coords.map((coord) => L.marker([coord[1], coord[0]], { icon }).on('click', onClick).addTo(map));
		if (markers.length > 1) {
			for (let i = 0; i < markers.length - 1; i++) {
				L.polyline([markers[i].getLatLng(), markers[i + 1].getLatLng()], { color: 'blue' }).addTo(map);
			}
		}
	});

	const toggleActivation = async () => {
		map.touchZoom.enabled() ? map.touchZoom.disable() : map.touchZoom.enable();
		map.doubleClickZoom.enabled() ? map.doubleClickZoom.disable() : map.doubleClickZoom.enable();
		map.scrollWheelZoom.enabled() ? map.scrollWheelZoom.disable() : map.scrollWheelZoom.enable();
		map.keyboard.enabled() ? map.keyboard.disable() : map.keyboard.enable();
		map.dragging.enabled() ? map.dragging.disable() : map.dragging.enable();
		deactivated = !deactivated;
	};
</script>

<div class="relative wrapper">
	<div class="absolute top-0 right-0 left-0 opacity-95" id="map" />
	{#if isActivatable}
		<div
			class={`map-button absolute bottom-1/3 left-[calc(50%-75px)] z-50 ${deactivated ? 'opacity-80' : 'opacity-40'}`}
		>
			<Button on:click={toggleActivation} shadow="blue" pill={true}
				>{$_('components.map.activate-button.label', { values: { pre: deactivated ? '' : 'de' } })}</Button
			>
		</div>
	{/if}
</div>

<style lang="postcss">
	.wrapper,
	#map {
		height: calc(100vh - var(--nav-height) - var(--footer-height));

		@media only screen and (max-width: 726px) {
			height: calc(100vh - var(--nav-height-mobile) - var(--footer-height-mobile));
		}
	}

	:global(.map-button button) {
		width: 150px;
	}
</style>
