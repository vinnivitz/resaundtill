<script lang="ts">
	import 'leaflet/dist/leaflet.css';

	import { Button, Spinner } from 'flowbite-svelte';
	import type { Position } from 'geojson';
	import { type Map, type Icon, type IconOptions, type LayerGroup, type Marker } from 'leaflet';
	import { onMount } from 'svelte';
	import { locale, t } from 'svelte-i18n';

	import type { BlogPostTranslation, MapItem } from '$lib/models';
	import { geoJsonStore, currentCoordinatesStore, dateStore } from '$lib/stores';
	import { getTranslation } from '$lib/utils';

	const {
		items,
		activatable = false,
		countryCode,
		showWholeCountry = false,
		showCustomMarker = false,
		navigate
	}: {
		items: MapItem[] | undefined;
		activatable?: boolean;
		countryCode?: string | undefined;
		showWholeCountry?: boolean;
		showCustomMarker?: boolean;
		navigate?: (id: string) => void;
	} = $props();

	let L: typeof import('leaflet');
	let map: Map | undefined = $state();
	let mapElement: HTMLDivElement;
	let spinnerElement: HTMLElement;
	let defaultIcon: Icon<IconOptions>;
	let resaTillIcon: Icon<IconOptions>;
	let deactivated = $state(true);
	let markerLayerGroup: LayerGroup;
	let countryBoundariesLayerGroup: LayerGroup;
	let initialized = false;

	const currentCoordinates = $derived(items?.[items.length - 1]?.location.coordinates ?? $currentCoordinatesStore);

	$effect(() => addCountryBoundaries(map, countryCode));

	$effect(() => addMarkers(items, map, defaultIcon, resaTillIcon));

	$effect(() => initView(currentCoordinates));

	onMount(() => {
		mapElement.style.opacity = '0';
		spinnerElement.style.display = 'block';
	});

	function addCountryBoundaries(map: Map | undefined, code: string | undefined): void {
		if (map && code) {
			countryBoundariesLayerGroup?.clearLayers();
			countryBoundariesLayerGroup = L.layerGroup().addTo(map);
			geoJsonStore.getGeoCountry(code).then((country) => {
				if (country) {
					const geoJson = L.geoJSON(country.feature, {
						style: {
							fillColor: 'transparent',
							color: 'black',
							weight: 2,
							opacity: 0.5
						}
					}).addTo(countryBoundariesLayerGroup);
					if (showWholeCountry) {
						map.fitBounds(geoJson.getBounds());
					}
				}
			});
		} else {
			countryBoundariesLayerGroup?.clearLayers();
		}
	}

	function initView(coordinates?: Position): void {
		if (!initialized && coordinates) {
			initialized = true;
			import('leaflet').then(async (leaflet) => {
				L = leaflet;
				await initializeMap();
				mapElement.style.removeProperty('opacity');
				spinnerElement.style.display = 'none';
			});
		}
	}

	function addMarkers(items?: MapItem[], map?: Map, defaultIcon?: Icon, resaTillIcon?: Icon): void {
		if (items && map && defaultIcon && resaTillIcon) {
			markerLayerGroup?.clearLayers();
			markerLayerGroup = L.layerGroup().addTo(map);
			const markers = getMarkers(items);
			if (markers.length > 1) {
				for (let index = 0; index < markers.length; index++) {
					if (index < markers.length - 1) {
						addTooltip(markers[index], items[index]);
						addPolyLine(markers[index], markers[index + 1], items[index + 1]);
					} else {
						addTooltip(markers[index], items[index], -95);
					}
				}
			}
		}
	}

	function addTooltip(marker: Marker, item: MapItem, offset = -37): void {
		const tooltip = L.tooltip({
			direction: 'top',
			offset: [0, offset]
		}).setContent(`
			<div class="flex flex-col items-center gap-2">
				<div>${getTranslation<BlogPostTranslation>(item.translations, $locale)?.title}</div>
				<div>${$dateStore(item.date)}</div>
			</div>
		`);
		marker.bindTooltip(tooltip).closeTooltip();
	}

	function addPolyLine(markerA: Marker, markerB: Marker, item: MapItem): void {
		L.polyline([markerA.getLatLng(), markerB.getLatLng()], {
			color: 'blue',
			dashArray: item.isFlight ? '6' : '',
			opacity: item.isFlight ? 0.2 : 0.5
		}).addTo(markerLayerGroup);
	}

	function getMarkers(items: MapItem[]): Marker[] {
		return items.map((item, index) => {
			return L.marker([item.location.coordinates[1], item.location.coordinates[0]], {
				icon: index === items.length - 1 && !showCustomMarker ? resaTillIcon : defaultIcon
			})
				.on('click', () => navigate?.(item.id))
				.addTo(markerLayerGroup);
		});
	}

	async function initializeMap(): Promise<void> {
		map = L.map('map');
		if (activatable) {
			disableMapInteractions();
		}
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '© OpenStreetMap'
		}).addTo(map);
		map.setView(currentCoordinates ? [currentCoordinates[1], currentCoordinates[0]] : [51.053_719, 13.737_908], 10);
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
	}

	function toggleActivation(): void {
		if (deactivated) {
			enableMapInteractions();
		} else {
			disableMapInteractions();
		}
		deactivated = !deactivated;
	}

	function enableMapInteractions(): void {
		map?.touchZoom.enable();
		map?.doubleClickZoom.enable();
		map?.scrollWheelZoom.enable();
		map?.keyboard.enable();
		map?.dragging.enable();
	}

	function disableMapInteractions(): void {
		map?.touchZoom.disable();
		map?.doubleClickZoom.disable();
		map?.scrollWheelZoom.disable();
		map?.keyboard.disable();
		map?.dragging.disable();
	}
</script>

<div class="wrapper relative">
	<div class="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform" bind:this={spinnerElement}>
		<Spinner size="24" color="blue" />
	</div>
	<div bind:this={mapElement} id="map" class="absolute left-0 right-0 top-0 opacity-95" style="opacity: 0;"></div>
	{#if activatable}
		<div
			class={`map-button absolute left-[calc(50%-75px)] top-[calc(100%-100px)] z-50 ${deactivated ? 'opacity-80' : 'opacity-40'}`}
		>
			<Button onclick={() => toggleActivation()} color="blue" pill={true}
				>{$t('components.map.activate-button.label', { values: { pre: deactivated ? '' : 'de' } })}
			</Button>
		</div>
	{/if}
</div>

<style lang="postcss">
	.wrapper,
	#map {
		height: calc(100vh - var(--nav-height));
		@media only screen and (max-width: 768px) {
			height: calc(100vh - var(--nav-height-mobile));
		}
	}

	:global(.map-button button) {
		width: 150px;
	}
</style>
