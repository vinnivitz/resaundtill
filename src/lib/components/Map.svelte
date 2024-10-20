<script lang="ts">
	import type { MapItem } from '$lib/models';
	import { Button, Spinner } from 'flowbite-svelte';
	import type { Map, LeafletMouseEvent } from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { createEventDispatcher, onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	export let items: MapItem[] = [];
	export let zoomOut = 3;
	export let deactivated = false;

	const isActivatable = deactivated;

	const dispatch = createEventDispatcher();

	let map: Map;
	let mapElement: HTMLDivElement;
	let spinnerElement: HTMLElement;

	onMount(async () => {
		mapElement.style.opacity = '0';
		spinnerElement.style.display = 'block';
		const L = await import('leaflet');
		initializeMap(L);
	});

	function initializeMap(L: typeof import('leaflet')) {
		const coords = getValidCoords();
		map = L.map('map');
		createMap(L, coords);
		if (deactivated) {
			disableMapInteractions();
		}
		addMarkersToMap(L, coords);
		mapElement.style.removeProperty('opacity');
		spinnerElement.style.display = 'none';
	}

	function getValidCoords() {
		if (items.length < 1 || !isValidCoord(items[0].coords)) {
			return [[51.053719, 13.737908]]; // Default coordinates
		}
		return items.map((item) => item.coords);
	}

	function isValidCoord(coord: number[]) {
		return coord && coord.length === 2;
	}

	function createMap(L: typeof import('leaflet'), coords: number[][]) {
		map.setView([coords[coords.length - 1][1], coords[coords.length - 1][0]], 13);
		map.zoomControl.remove();
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '© OpenStreetMap'
		}).addTo(map);
		map.zoomOut(zoomOut);
	}

	function disableMapInteractions() {
		map.touchZoom.disable();
		map.doubleClickZoom.disable();
		map.scrollWheelZoom.disable();
		map.keyboard.disable();
		map.dragging.disable();
	}

	function addMarkersToMap(L: typeof import('leaflet'), coords: number[][]): void {
		const iconDefault = L.icon({
			iconUrl: '/images/map/marker.png',
			iconSize: [20, 35],
			shadowSize: [0, 0],
			iconAnchor: [10, 35],
			popupAnchor: [0, 0]
		});

		const iconResaTill = L.icon({
			iconUrl: '/images/map/tillresa_marker.png',
			iconSize: [38, 95],
			shadowSize: [50, 64],
			iconAnchor: [22, 94],
			popupAnchor: [-3, -76]
		});

		const markers = coords.map((coord, index) => {
			return L.marker([coord[1], coord[0]], {
				icon: index === coords.length - 1 ? iconResaTill : iconDefault
			})
				.on('click', (e: LeafletMouseEvent) => dispatch('activeCoords', [e.latlng.lat, e.latlng.lng]))
				.addTo(map);
		});

		if (markers.length > 1) {
			markers.forEach((marker, index) => {
				if (index < markers.length - 1) {
					const nextMarker = markers[index + 1];
					L.polyline([marker.getLatLng(), nextMarker.getLatLng()], {
						color: 'blue',
						dashArray: items[index + 1].isFlight ? '6' : '',
						opacity: items[index + 1].isFlight ? 0.2 : 0.5
					}).addTo(map);
				}
			});
		}
	}

	async function toggleActivation() {
		map.touchZoom.enabled() ? map.touchZoom.disable() : map.touchZoom.enable();
		map.doubleClickZoom.enabled() ? map.doubleClickZoom.disable() : map.doubleClickZoom.enable();
		map.scrollWheelZoom.enabled() ? map.scrollWheelZoom.disable() : map.scrollWheelZoom.enable();
		map.keyboard.enabled() ? map.keyboard.disable() : map.keyboard.enable();
		map.dragging.enabled() ? map.dragging.disable() : map.dragging.enable();
		deactivated = !deactivated;
	}
</script>

<div class="wrapper relative">
	<div class="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform" bind:this={spinnerElement}>
		<Spinner size="24" color="blue" />
	</div>
	<div bind:this={mapElement} id="map" class="absolute left-0 right-0 top-0 opacity-95" style="opacity: 0;" />
	{#if isActivatable}
		<div
			class={`map-button absolute bottom-1/3 left-[calc(50%-75px)] z-50 ${deactivated ? 'opacity-80' : 'opacity-40'}`}
		>
			<Button on:click={toggleActivation} color="blue" pill={true}
				>{$_('components.map.activate-button.label', { values: { pre: deactivated ? '' : 'de' } })}
			</Button>
		</div>
	{/if}
</div>

<style lang="postcss">
	.wrapper,
	#map {
		height: calc(100vh - var(--nav-height) - var(--footer-height));

		@media only screen and (max-width: 726px) {
			height: calc(100vh - var(--nav-height-mobile) - var(--footer-height));
		}
	}

	:global(.map-button button) {
		width: 150px;
	}
</style>
