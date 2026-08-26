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

		<div class="side-col left" class:hidden={!isMapRoute}>
			{#if isMapRoute}<IndicatorPanel />{/if}
		</div>
		<div class="side-col right" class:hidden={!isMapRoute}>
			{#if isMapRoute}<InfoPanel />{/if}
		</div>

		{#if !isMapRoute}
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
		/* Indicator pane / map / legend pane widths. The legend pane is wider so
		   its chart and text stay legible; the map takes whatever's left. */
		--left-col: 15%;
		--right-col: 20%;
	}

	.map-layer {
		position: absolute;
		/* Only visibility toggles with route, so the map's actual pixel geometry
		   never changes and there's genuinely no map underneath the side panes
		   (they're separate columns, not an overlay). Inset by the same gutter as
		   the panes' own padding, on all four sides, so the rounded corners below
		   actually show against the page background instead of butting flush
		   against the header/tab bar/panes. */
		top: 0.85rem;
		bottom: 0.85rem;
		left: calc(var(--left-col) + 0.85rem);
		right: calc(var(--right-col) + 0.85rem);
		border-radius: var(--radius);
		overflow: hidden;
		/* Establishes a stacking context so Leaflet's internal panes/controls
		   (which use high explicit z-index values) can't escape above the side panes. */
		z-index: 0;
	}

	.map-layer.hidden {
		visibility: hidden;
		pointer-events: none;
	}

	.side-col {
		position: absolute;
		top: 0;
		bottom: 0;
		box-sizing: border-box;
		padding: 0.85rem;
		background: var(--surface-2);
		z-index: 1;
		overflow-y: auto;
	}

	.side-col.left {
		left: 0;
		width: var(--left-col);
	}

	.side-col.right {
		right: 0;
		width: var(--right-col);
	}

	.side-col.hidden {
		visibility: hidden;
		pointer-events: none;
	}

	.page-layer {
		position: absolute;
		inset: 0;
		overflow-y: auto;
		background: var(--surface-2);
	}
</style>
