<script lang="ts">
	import 'leaflet/dist/leaflet.css';

	import { Button, Spinner } from 'flowbite-svelte';
	import type { Position } from 'geojson';
	import type { Map, Icon, IconOptions, LayerGroup, Marker } from 'leaflet';
	import { onMount } from 'svelte';
	import { locale, t } from 'svelte-i18n';

	import type { BlogPostTranslation, MapItem } from '$lib/models';
	import { geoJsonStore, currentCoordinatesStore, dateStore } from '$lib/stores';
	import { getTranslation } from '$lib/utils';

	type CluserConfig = {
		lat: number;
		lng: number;
		cluster: MapItem[];
	};

	const {
		items,
		activatable = false,
		countryCode,
		showWholeCountry = false,
		showCustomMarker = false,
		grouping = true,
		navigate
	}: {
		items: MapItem[] | undefined;
		activatable?: boolean;
		countryCode?: string | undefined;
		showWholeCountry?: boolean;
		showCustomMarker?: boolean;
		grouping?: boolean;
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

	const groupDistanceByZoom: Record<number, number> = {
		0: 1_500_000,
		1: 1_100_000,
		2: 1_000_000,
		3: 800_000,
		4: 500_000,
		5: 200_000,
		6: 150_000,
		7: 100_000,
		8: 50_000,
		9: 20_000,
		10: 8000,
		11: 5000,
		12: 3000,
		13: 2000,
		14: 1000,
		15: 800,
		16: 400,
		17: 200,
		18: 100,
		19: 50
	};

	function getGroupThreshold(zoom: number): number {
		let closestZoom = 0;
		for (const level in groupDistanceByZoom) {
			const z = Number.parseInt(level);
			if (zoom >= z && z >= closestZoom) {
				closestZoom = z;
			}
		}
		return groupDistanceByZoom[closestZoom];
	}

	$effect(() => addCountryBoundaries(map, countryCode));
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

	async function initializeMap(): Promise<void> {
		map = L.map('map');

		if (activatable) {
			disableMapInteractions();
		}

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '© OpenStreetMap'
		}).addTo(map);

		map.setView(currentCoordinates ? [currentCoordinates[1], currentCoordinates[0]] : [51.053_719, 13.737_908], 4);

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
			popupAnchor: [-3, -76]
		});

		map.on('zoomend', () => redrawMarkersAndLines(map, items));

		redrawMarkersAndLines(map, items);
	}

	function redrawMarkersAndLines(map: Map | undefined, items: MapItem[] | undefined): void {
		if (!items || !map || !defaultIcon || !resaTillIcon || items.length === 0) {
			return;
		}
		markerLayerGroup?.clearLayers();
		markerLayerGroup = L.layerGroup().addTo(map);

		if (grouping) {
			const zoom = map.getZoom();
			const threshold = getGroupThreshold(zoom);
			const clusters = buildConsecutiveClusters(items, threshold);

			const clusterCenters: CluserConfig[] = getClusterCenters(clusters);

			for (let index = 0; index < clusterCenters.length; index++) {
				const clusterMarker = getClusterMarker(clusterCenters, index);
				addClusterTooltip(clusterMarker, clusterCenters[index].cluster);
			}

			for (let index = 0; index < clusterCenters.length - 1; index++) {
				addPolyLinesFromClusters(clusterCenters[index], clusterCenters[index + 1]);
			}
		} else {
			addMarkersAndTooltips(items);

			for (let index = 0; index < items.length - 1; index++) {
				const currentItem = items[index];
				const nextItem = items[index + 1];
				if (currentItem.nextItemId === nextItem.id) {
					addPolyLineFromItems(currentItem, nextItem);
				}
			}
		}
	}

	function addPolyLinesFromClusters(currentCenter: CluserConfig, nextCenter: CluserConfig): void {
		const lastInItem = currentCenter.cluster[currentCenter.cluster.length - 1];
		const firstInNext = nextCenter.cluster[0];

		if (lastInItem.nextItemId === firstInNext.id) {
			const dashArray = firstInNext.isFlight ? '6' : '';
			const opacity = firstInNext.isFlight ? 0.2 : 0.5;

			L.polyline(
				[
					[currentCenter.lat, currentCenter.lng],
					[nextCenter.lat, nextCenter.lng]
				],
				{
					color: 'blue',
					dashArray,
					opacity
				}
			).addTo(markerLayerGroup);
		}
	}

	function getClusterMarker(clusters: CluserConfig[], index: number): Marker {
		const { lat, lng, cluster } = clusters[index];
		const item = cluster[0];

		const isLastCluster = index === clusters.length - 1;
		const icon = isLastCluster && showCustomMarker ? resaTillIcon : defaultIcon;

		return L.marker([lat, lng], { icon })
			.addTo(markerLayerGroup)
			.on('click', () => {
				if (cluster.length > 1) {
					zoomIntoSinglePosts(cluster, lat, lng);
				} else {
					navigate?.(item.id);
				}
			});
	}

	function getClusterCenters(clusters: MapItem[][]): CluserConfig[] {
		const clusterCenters: CluserConfig[] = [];

		for (const cluster of clusters) {
			if (cluster.length === 0) {
				continue;
			}

			let sumLat = 0;
			let sumLng = 0;
			for (const clusterItem of cluster) {
				sumLat += clusterItem.location.coordinates[1];
				sumLng += clusterItem.location.coordinates[0];
			}
			const averageLat = sumLat / cluster.length;
			const averageLng = sumLng / cluster.length;

			clusterCenters.push({ lat: averageLat, lng: averageLng, cluster });
		}

		return clusterCenters;
	}

	function addMarkersAndTooltips(items: MapItem[]): void {
		for (const [index, item] of items.entries()) {
			const marker = L.marker([item.location.coordinates[1], item.location.coordinates[0]], {
				icon: index === items.length - 1 && !showCustomMarker ? resaTillIcon : defaultIcon
			})
				.on('click', () => navigate?.(item.id))
				.addTo(markerLayerGroup);

			addTooltip(marker, item, index === items.length - 1 ? -95 : -37);
		}
	}

	function addPolyLineFromItems(itemA: MapItem, itemB: MapItem): void {
		const dash = itemB.isFlight ? '6' : '';
		const opacity = itemB.isFlight ? 0.2 : 0.5;

		L.polyline(
			[
				[itemA.location.coordinates[1], itemA.location.coordinates[0]],
				[itemB.location.coordinates[1], itemB.location.coordinates[0]]
			],
			{
				color: 'blue',
				dashArray: dash,
				opacity
			}
		).addTo(markerLayerGroup);
	}

	function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
		const p1 = L.latLng(lat1, lon1);
		const p2 = L.latLng(lat2, lon2);
		return p1.distanceTo(p2);
	}

	function buildConsecutiveClusters(items: MapItem[], threshold: number): MapItem[][] {
		if (items.length === 0) return [];

		const clusters: MapItem[][] = [];
		let currentCluster: MapItem[] = [items[0]];

		for (let index = 1; index < items.length; index++) {
			const previousItem = items[index - 1];
			const currentItem = items[index];

			const distribution = getDistanceMeters(
				previousItem.location.coordinates[1],
				previousItem.location.coordinates[0],
				currentItem.location.coordinates[1],
				currentItem.location.coordinates[0]
			);

			if (distribution <= threshold) {
				currentCluster.push(currentItem);
			} else {
				clusters.push(currentCluster);
				currentCluster = [currentItem];
			}
		}
		clusters.push(currentCluster);
		return clusters;
	}

	function addClusterTooltip(marker: Marker, cluster: MapItem[]): void {
		if (cluster.length === 1) {
			const item = cluster[0];
			const singleDate = $dateStore(item.date);
			const tooltip = L.tooltip({
				direction: 'top',
				offset: [0, -37]
			}).setContent(`
				<div class="flex flex-col items-center gap-2">
					<div>${getTranslation<BlogPostTranslation>(item.translations, $locale)?.title}</div>
					<div>${singleDate}</div>
				</div>
			`);
			marker.bindTooltip(tooltip).closeTooltip();
			return;
		}

		let earliestDate = cluster[0].date;
		let latestDate = cluster[0].date;
		for (const clusterItem of cluster) {
			if (clusterItem.date < earliestDate) {
				earliestDate = clusterItem.date;
			}
			if (clusterItem.date > latestDate) {
				latestDate = clusterItem.date;
			}
		}
		const dateRangeString = `${$dateStore(earliestDate)} - ${$dateStore(latestDate)}`;

		const tooltip = L.tooltip({
			direction: 'top',
			offset: [0, -37]
		}).setContent(`
			<div class="flex flex-col items-center gap-2">
				<div>${dateRangeString}</div>
			</div>
		`);
		marker.bindTooltip(tooltip).closeTooltip();
	}

	function zoomIntoSinglePosts(cluster: MapItem[], markerLat: number, markerLng: number): void {
		if (!map || !items) return;

		const currentZoom = map.getZoom();
		const maxZoom = map.getMaxZoom() || 19;

		if (cluster.length === 1) {
			navigate?.(cluster[0].id);
			return;
		}

		const firstClusterItem = cluster[0];
		const originalSize = cluster.length;

		for (let z = currentZoom + 1; z <= maxZoom; z++) {
			const threshold = getGroupThreshold(z);
			const newClusters = buildConsecutiveClusters(items, threshold);

			const foundCluster = newClusters.find((_cluster) =>
				_cluster.some((clusterItem) => clusterItem.id === firstClusterItem.id)
			);
			if (foundCluster && foundCluster.length < originalSize) {
				map.setView([markerLat, markerLng], z);
				return;
			}
		}

		navigate?.(firstClusterItem.id);
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
			class={`map-button absolute left-[calc(50%-75px)] top-[calc(100%-100px)] z-50 ${
				deactivated ? 'opacity-80' : 'opacity-40'
			}`}
		>
			<Button on:click={toggleActivation} color="blue" pill={true} class="focus:ring-0">
				{$t('components.map.activate-button.label', {
					values: { pre: deactivated ? '' : 'de' }
				})}
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
</style>
