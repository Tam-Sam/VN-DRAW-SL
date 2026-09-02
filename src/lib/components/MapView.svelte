<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type * as LType from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import { droughtState } from '$lib/state/drought-state.svelte';
	import {
		riskInfoFor,
		indicatorValue,
		INDICATORS,
		type DriFeature,
		type DriFeatureCollection,
		type DriProperties,
		type Domain,
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
	let boundaryLayer: LType.GeoJSON | undefined;
	let renderedData: DriFeatureCollection | null = null;
	let satelliteLayer: LType.TileLayer | undefined;
	let streetLayer: LType.TileLayer | undefined;
	let resizeObserver: ResizeObserver | undefined;
	// Plain (non-reactive) lookup table: internal bookkeeping for the Leaflet
	// instance, never read by the template, so it doesn't need Svelte reactivity.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const layersByName = new Map<string, LType.Layer>();

	// ATTENTION HERE — administrative boundary polygon appearance.
	// This is the single place that decides how each province is filled/outlined
	// on the choropleth. risk?.color (from dri.ts — DRI's fixed discrete classes,
	// or the DHI/DEI/DVI continuous gradient scaled to `domain`) drives the
	// fill; provinces with no value fall back to neutral #cccccc.
	function styleFor(
		feature: DriFeature,
		indicator: IndicatorId,
		year: number,
		month: number,
		domain: Domain | null
	): LType.PathOptions {
		const risk = riskInfoFor(
			indicatorValue(feature.properties, indicator, year, month),
			indicator,
			domain
		);
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
	function popupHtml(
		props: DriProperties,
		indicator: IndicatorId,
		year: number,
		month: number,
		domain: Domain | null
	): string {
		const value = indicatorValue(props, indicator, year, month);
		const risk = riskInfoFor(value, indicator, domain);
		const label = INDICATOR_LABEL[indicator];
		const period = indicator === 'dhi' ? `${String(month).padStart(2, '0')}/${year}` : `${year}`;
		return `<div class="dri-popup">
			<h3>${props.ADM1_EN}</h3>
			<div class="popup-row"><strong>${label} ${period}:</strong> ${value != null ? value.toFixed(2) : 'No data'}</div>
			<div class="popup-row"><strong>Risk category:</strong> ${risk?.label ?? 'Unknown'}</div>
		</div>`;
	}

	function selectProvince(props: DriProperties) {
		droughtState.selectedProvinceName = props.ADM1_EN;
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

			void droughtState.ensureLoaded(droughtState.selectedIndicator, droughtState.selectedYear);

			// The side panels are user-resizable (+layout.svelte), which changes
			// this container's size without firing a window `resize` event, so
			// Leaflet's own resize handling never sees it — watch the container
			// directly instead so tiles/panes stay aligned as it's dragged.
			resizeObserver = new ResizeObserver(() => map?.invalidateSize());
			resizeObserver.observe(container);
		});
	});

	onDestroy(() => resizeObserver?.disconnect());

	// Fetch whichever indicator/year is now selected (no-ops if already cached).
	$effect(() => {
		void droughtState.ensureLoaded(droughtState.selectedIndicator, droughtState.selectedYear);
	});

	// (Re)build the choropleth layer whenever the active dataset actually
	// changes — a different indicator, or (for DHI) a different year's file.
	// Same-file year/month changes for DRI/DEI/DVI are handled by the restyle
	// effect below instead, without tearing the layer down.
	$effect(() => {
		const fc = droughtState.currentData;
		if (!L || !map || !fc || fc === renderedData) return;

		if (geoJsonLayer) {
			map.removeLayer(geoJsonLayer);
			layersByName.clear();
		}

		const indicator = droughtState.selectedIndicator;
		const year = droughtState.selectedYear;
		const month = droughtState.selectedMonth;
		const domain = droughtState.continuousDomain;
		geoJsonLayer = L.geoJSON(fc, {
			style: (feature) => styleFor(feature as DriFeature, indicator, year, month, domain),
			onEachFeature: (feature, layer) => {
				const props = (feature as DriFeature).properties;
				layersByName.set(props.ADM1_EN, layer);
				layer.bindPopup(popupHtml(props, indicator, year, month, domain), { maxWidth: 280 });
				layer.on('click', () => selectProvince(props));
			}
		}).addTo(map);
		renderedData = fc;

		droughtState.focusProvince = (name: string) => {
			const layer = layersByName.get(name) as LType.Polygon | undefined;
			if (!layer || !map) return;
			map.fitBounds(layer.getBounds(), { maxZoom: 8, padding: [40, 40] });
			layer.openPopup();
			selectProvince((layer as unknown as { feature: DriFeature }).feature.properties);
		};
	});

	// Restyle + refresh popup content in place when the year/month changes
	// within the already-loaded dataset (no rebuild needed).
	$effect(() => {
		const indicator = droughtState.selectedIndicator;
		const year = droughtState.selectedYear;
		const month = droughtState.selectedMonth;
		const domain = droughtState.continuousDomain;
		if (!geoJsonLayer) return;
		geoJsonLayer.setStyle((feature) =>
			styleFor(feature as DriFeature, indicator, year, month, domain)
		);
		geoJsonLayer.eachLayer((layer) => {
			const props = (layer as unknown as { feature: DriFeature }).feature.properties;
			layer.setPopupContent(popupHtml(props, indicator, year, month, domain));
		});
	});

	// Vietnam's new 34-province boundary (2025 merger) — a togglable outline
	// overlay, independent of the drought choropleth. Loaded lazily on first
	// enable, then just shown/hidden afterwards (never rebuilt).
	$effect(() => {
		if (droughtState.showNewBoundary) void droughtState.loadBoundary();
	});

	// Both droughtState.boundary and droughtState.showNewBoundary are read
	// unconditionally (before any early return) so this effect re-fires when
	// EITHER changes — e.g. the boundary finishes loading after the toggle was
	// already switched on. (boundaryLayer itself is a plain, non-reactive
	// variable, so it can't be the thing this effect reacts to.)
	$effect(() => {
		const fc = droughtState.boundary;
		const show = droughtState.showNewBoundary;
		if (!L || !map) return;

		if (!boundaryLayer && fc) {
			// Visually distinct from the choropleth's own dark province outlines
			// (#232323) — otherwise toggling this on is imperceptible.
			boundaryLayer = L.geoJSON(fc, {
				style: { color: '#2563eb', weight: 2.5, opacity: 0.9, dashArray: '6 4', fill: false },
				onEachFeature: (feature, layer) => {
					const name = (feature as GeoJSON.Feature).properties?.adm1_name as string | undefined;
					if (name) layer.bindTooltip(name, { sticky: true });
				}
			});
		}

		if (!boundaryLayer) return;
		if (show) boundaryLayer.addTo(map);
		else map.removeLayer(boundaryLayer);
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
