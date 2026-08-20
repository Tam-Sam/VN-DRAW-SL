<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Header from '$lib/components/Header.svelte';
	import TabBar from '$lib/components/TabBar.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import IndicatorPanel from '$lib/components/IndicatorPanel.svelte';
	import InfoPanel from '$lib/components/InfoPanel.svelte';

	let { children } = $props();

	// page.url.pathname is the real browser path, which includes the deployed
	// base path (e.g. "/VN-DRAW-SL/") — compare against resolve('/'), not a
	// bare "/", or this is always false once the site isn't hosted at the domain root.
	const isMapRoute = $derived(page.url.pathname === resolve('/'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>VN-DRAW: Vietnam Drought Risk Assessment and Warning</title>
</svelte:head>

<div class="app-shell">
	<Header />

	<div class="app-body">
		<!-- MapView lives here, outside the routed page, so it never unmounts on -->
		<!-- navigation: its Leaflet instance (pan/zoom/layers) survives tab switches. -->
		<div class="map-layer" class:hidden={!isMapRoute} aria-hidden={!isMapRoute}>
			<MapView />
		</div>

		{#if isMapRoute}
			<div class="map-chrome">
				<IndicatorPanel />
				<div class="chrome-spacer"></div>
				<InfoPanel />
			</div>
		{:else}
			<div class="page-layer">
				{@render children()}
			</div>
		{/if}
	</div>

	<TabBar />
</div>

<style>
	.app-shell {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.app-body {
		position: relative;
		flex: 1;
		min-height: 0;
	}

	.map-layer {
		position: absolute;
		inset: 0;
		/* Establishes a stacking context so Leaflet's internal panes/controls
		   (which use high explicit z-index values) can't escape above map-chrome. */
		z-index: 0;
	}

	.map-layer.hidden {
		visibility: hidden;
		pointer-events: none;
	}

	.map-chrome {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: flex;
		gap: 0;
		padding: 0.85rem;
		pointer-events: none;
	}

	.map-chrome > :global(*) {
		pointer-events: auto;
	}

	.chrome-spacer {
		flex: 1;
		/* Empty, but still a direct child of .map-chrome, so it would otherwise
		   inherit pointer-events: auto from the rule above and sit on top of the
		   map — silently blocking scroll-wheel zoom, drag-panning, and clicks
		   over the entire central map area. */
		pointer-events: none;
	}

	.page-layer {
		position: absolute;
		inset: 0;
		overflow-y: auto;
		background: var(--surface-2);
	}
</style>
