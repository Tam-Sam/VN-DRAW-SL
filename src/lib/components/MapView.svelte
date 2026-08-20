<script lang="ts">
	import { onMount } from 'svelte';
	import type * as LType from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { droughtState } from '$lib/state/drought-state.svelte';
	import {
		riskClassFor,
		indicatorValue,
		INDICATORS,
		type DriFeature,
		type DriProperties,
		type IndicatorId
	} from '$lib/dri';

	const INDICATOR_LABEL: Record<IndicatorId, string> = Object.fromEntries(
		INDICATORS.map((ind) => [ind.id, ind.label])
	) as Record<IndicatorId, string>;

	// Matches the bounding box qgis2web baked into the legacy export.
	const VN_BOUNDS: LType.LatLngBoundsExpression = [
		[7.891040705432752, 93.08914151330195],
		[24.91287850308276, 120.19799430215197]
	];

	let container: HTMLDivElement;
	let L: typeof LType | undefined;
	let map: LType.Map | undefined;
	let geoJsonLayer: LType.GeoJSON | undefined;
	let satelliteLayer: LType.TileLayer | undefined;
	let streetLayer: LType.TileLayer | undefined;
	// Plain (non-reactive) lookup table: internal bookkeeping for the Leaflet
	// instance, never read by the template, so it doesn't need Svelte reactivity.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const layersByPcode = new Map<string, LType.Layer>();

	// ATTENTION HERE — administrative boundary polygon appearance.
	// This is the single place that decides how each province is filled/outlined
	// on the choropleth. risk?.color (from RISK_CLASSES in dri.ts) drives the
	// fill; provinces with no value for the selected indicator/year fall back to
	// the neutral #cccccc grey below.
	function styleFor(feature: DriFeature, indicator: IndicatorId, year: number): LType.PathOptions {
		const risk = riskClassFor(indicatorValue(feature.properties, indicator, year));
		return {
			color: '#232323',
			weight: 1,
			fillOpacity: 1,
			fillColor: risk?.color ?? '#cccccc'
		};
	}

	// ATTENTION HERE — popup content and styling.
	// This builds the HTML shown when a province is clicked; matching CSS for
	// .dri-popup / .popup-row lives in the style block at the bottom of this file.
	function popupHtml(props: DriProperties, indicator: IndicatorId, year: number): string {
		const value = indicatorValue(props, indicator, year);
		const risk = riskClassFor(value);
		const label = INDICATOR_LABEL[indicator];
		return `<div class="dri-popup">
			<h3>${props.ADM1_EN}</h3>
			<div class="popup-row"><strong>${label} ${year}:</strong> ${value != null ? value.toFixed(2) : 'No data'}</div>
			<div class="popup-row"><strong>Risk category:</strong> ${risk?.label ?? 'Unknown'}</div>
		</div>`;
	}

	function selectProvince(props: DriProperties) {
		droughtState.selectedProvince = props;
	}

	onMount(() => {
		// Leaflet touches `window`/`document` on import, so it can only load in the browser.
		import('leaflet').then((mod) => {
			L = mod.default;

			map = L.map(container, { zoomControl: false, maxZoom: 18, minZoom: 4 }).fitBounds(VN_BOUNDS);
			L.control.zoom({ position: 'topleft' }).addTo(map);

			satelliteLayer = L.tileLayer(
				'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
				{ attribution: 'Tiles &copy; Esri', maxZoom: 18, opacity: 0.8 }
			);
			streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap contributors',
				maxZoom: 19
			});
			(droughtState.basemap === 'satellite' ? satelliteLayer : streetLayer).addTo(map);

			void droughtState.load();
		});
	});

	// Build the choropleth layer once the data has loaded (runs once: guarded by geoJsonLayer).
	$effect(() => {
		const fc = droughtState.data;
		if (!L || !map || !fc || geoJsonLayer) return;

		const indicator = droughtState.selectedIndicator;
		const year = droughtState.selectedYear;
		geoJsonLayer = L.geoJSON(fc, {
			style: (feature) => styleFor(feature as DriFeature, indicator, year),
			onEachFeature: (feature, layer) => {
				const props = (feature as DriFeature).properties;
				layersByPcode.set(props.ADM1_PCODE, layer);
				layer.bindPopup(popupHtml(props, indicator, year), { maxWidth: 280 });
				layer.on('click', () => selectProvince(props));
			}
		}).addTo(map);

		droughtState.focusProvince = (pcode: string) => {
			const layer = layersByPcode.get(pcode) as LType.Polygon | undefined;
			if (!layer || !map) return;
			map.fitBounds(layer.getBounds(), { maxZoom: 8, padding: [40, 40] });
			layer.openPopup();
			selectProvince((layer as unknown as { feature: DriFeature }).feature.properties);
		};
	});

	// Restyle + refresh popup content in place when the selected layer (indicator) or year changes.
	$effect(() => {
		const indicator = droughtState.selectedIndicator;
		const year = droughtState.selectedYear;
		if (!geoJsonLayer) return;
		geoJsonLayer.setStyle((feature) => styleFor(feature as DriFeature, indicator, year));
		geoJsonLayer.eachLayer((layer) => {
			const props = (layer as unknown as { feature: DriFeature }).feature.properties;
			layer.setPopupContent(popupHtml(props, indicator, year));
		});
	});

	// Swap basemap tile layers without touching the choropleth or view state.
	$effect(() => {
		const target = droughtState.basemap;
		if (!map || !satelliteLayer || !streetLayer) return;
		if (target === 'satellite') {
			map.addLayer(satelliteLayer);
			map.removeLayer(streetLayer);
		} else {
			map.addLayer(streetLayer);
			map.removeLayer(satelliteLayer);
		}
	});
</script>

<div class="map-host" bind:this={container}></div>

<style>
	.map-host {
		width: 100%;
		height: 100%;
	}

	:global(.dri-popup h3) {
		margin: 0 0 0.4rem;
		font-size: 0.95rem;
	}

	:global(.dri-popup .popup-row) {
		font-size: 0.85rem;
		margin: 0.15rem 0;
	}
</style>
