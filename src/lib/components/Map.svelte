<script lang="ts">
	import { type GeoPoint, type MapItem } from '$lib/models';
	import { countryStore } from '$lib/stores';
	import { dataStore } from '$lib/stores/data.store';
	import { Button, Spinner } from 'flowbite-svelte';
	import type { Map, LeafletMouseEvent, GeoJSON, Icon, IconOptions } from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { createEventDispatcher, onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	export let items: MapItem[] = [];
	export let deactivated = false;
	export let countryCode: string | undefined = undefined;

	const dispatch = createEventDispatcher();

	let L: typeof import('leaflet');
	let map: Map;
	let mapElement: HTMLDivElement;
	let spinnerElement: HTMLElement;
	let geoJSON: GeoJSON | null;
	let defaultIcon: Icon<IconOptions>;
	let resaTillIcon: Icon<IconOptions>;
	let currentCoordinates: GeoPoint | undefined;

	$: if (items.length > 0) {
		if (map && defaultIcon && resaTillIcon) {
			const markers = items.map((item, index) => {
				return L.marker([item.location.coordinates[1], item.location.coordinates[0]], {
					icon: index === items.length - 1 ? resaTillIcon : defaultIcon
				})
					.on('click', () => dispatch('navigate', item.id))
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
	}

	onMount(async () => {
		mapElement.style.opacity = '0';
		spinnerElement.style.display = 'block';
		L = await import('leaflet');
		dataStore.subscribe(async (data) => {
			if (data?.currentCoordinates !== currentCoordinates) {
				currentCoordinates = data.currentCoordinates;
				await initializeMap();
				mapElement.style.removeProperty('opacity');
				spinnerElement.style.display = 'none';
			}
		});
		// if (countryCode) {
		// 	geoJSON = await getGeoJSON(L, countryCode);
		// }
		// if (geoJSON) {
		// 	geoJSON.addTo(map);
		// }
	});

	async function initializeMap() {
		// const coords = getValidCoords();
		map = L.map('map');
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '© OpenStreetMap'
		}).addTo(map);
		map.setView(currentCoordinates ? [currentCoordinates[1], currentCoordinates[0]] : [51.053719, 13.737908], 10);
		defaultIcon = L.icon({
			iconUrl: '/images/map/marker.png',
			iconSize: [20, 35],
			shadowSize: [0, 0],
			iconAnchor: [10, 35],
			popupAnchor: [0, 0]
		});

		resaTillIcon = L.icon({
			iconUrl: '/images/map/tillresa_marker.png',
			iconSize: [38, 95],
			shadowSize: [50, 64],
			iconAnchor: [22, 94],
			popupAnchor: [-3, -76],
			className: 'resa-till-marker'
		});
		// createMap(L, coords);
		// if (deactivated) {
		// 	disableMapInteractions();
		// }
		// addMarkersToMap(L, coords);
		// mapElement.style.removeProperty('opacity');
		// spinnerElement.style.display = 'none';
	}

	function getValidCoords() {
		if (items.length < 1 || !isValidCoord(items[0].location.coordinates)) {
			return [[51.053719, 13.737908]]; // Default coordinates
		}
		return items.map((item) => item.location.coordinates);
	}

	function isValidCoord(coord: number[]) {
		return coord && coord.length === 2;
	}

	function createMap(L: typeof import('leaflet'), coords: number[][]) {
		if (geoJSON) {
			map.fitBounds(geoJSON.getBounds());
		} else {
			map.setView([coords[coords.length - 1][1], coords[coords.length - 1][0]], 13);
		}
		map.zoomControl.remove();
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '© OpenStreetMap'
		}).addTo(map);
		if (!geoJSON) {
			map.setZoom(10);
		}
	}

	function disableMapInteractions() {
		map.touchZoom.disable();
		map.doubleClickZoom.disable();
		map.scrollWheelZoom.disable();
		map.keyboard.disable();
		map.dragging.disable();
	}

	async function getGeoJSON(code: string): Promise<GeoJSON | null> {
		const country = await countryStore.getGeoCountry(code);
		if (country) {
			return L.geoJSON(country.feature, {
				style: {
					fillColor: 'transparent',
					color: 'black',
					weight: 2,
					opacity: 0.5
				}
			});
		}
		return null;
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
			popupAnchor: [-3, -76],
			className: 'resa-till-marker'
		});

		const markers = coords.map((coord, index) => {
			return L.marker([coord[1], coord[0]], {
				icon: index === coords.length - 1 ? iconResaTill : iconDefault
			})
				.on('click', (e: LeafletMouseEvent) =>
					dispatch(
						'navigate',
						items.find(
							(item) => item.location.coordinates[0] === e.latlng.lng && item.location.coordinates[1] === e.latlng.lat
						)?.id
					)
				)
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
	{#if deactivated}
		<div
			class={`map-button absolute left-[calc(50%-75px)] top-[calc(100%-100px)] z-50 ${deactivated ? 'opacity-80' : 'opacity-40'}`}
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
		height: calc(100vh - var(--nav-height));

		@media only screen and (max-width: 726px) {
			height: calc(100vh - var(--nav-height-mobile));
		}
	}

	:global(.map-button button) {
		width: 150px;
	}
</style>
