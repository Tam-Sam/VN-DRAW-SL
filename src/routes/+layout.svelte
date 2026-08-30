<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import TabBar from '$lib/components/TabBar.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import IndicatorPanel from '$lib/components/IndicatorPanel.svelte';
	import InfoPanel from '$lib/components/InfoPanel.svelte';

	let { children } = $props();

	// page.route.id is the route's definition path ("/", "/home", ...) — stable
	// regardless of base path or trailingSlash config, unlike page.url.pathname
	// (which would be e.g. "/VN-DRAW-SL/" or "/home/" and need manual matching).
	const isMapRoute = $derived(page.route.id === '/');

	// Side pane widths, in pixels — dragged via the resize handles below. The
	// map pane isn't tracked separately: it's `left`/`right`-anchored (see
	// .map-layer below) so it always fills whatever space these two leave.
	const MIN_PANE_WIDTH = 200;
	const MAX_PANE_WIDTH = 480;
	let leftWidth = $state(220);
	let rightWidth = $state(300);

	function clampWidth(value: number): number {
		return Math.min(MAX_PANE_WIDTH, Math.max(MIN_PANE_WIDTH, value));
	}

	function startResize(event: PointerEvent, side: 'left' | 'right') {
		event.preventDefault();
		const startX = event.clientX;
		const startWidth = side === 'left' ? leftWidth : rightWidth;
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';

		function onMove(moveEvent: PointerEvent) {
			// Left pane grows toward the right as the pointer moves right; the
			// right pane grows toward the left as the pointer moves left.
			const delta = side === 'left' ? moveEvent.clientX - startX : startX - moveEvent.clientX;
			const next = clampWidth(startWidth + delta);
			if (side === 'left') leftWidth = next;
			else rightWidth = next;
		}

		function onUp() {
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		}

		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
	}

	// Arrow-key resizing for keyboard users (WAI-ARIA "window splitter" pattern).
	function nudgeResize(event: KeyboardEvent, side: 'left' | 'right') {
		const step = event.shiftKey ? 40 : 16;
		const growsRight = side === 'left';
		let delta: number;
		if (event.key === 'ArrowLeft') delta = growsRight ? -step : step;
		else if (event.key === 'ArrowRight') delta = growsRight ? step : -step;
		else return;

		event.preventDefault();
		if (side === 'left') leftWidth = clampWidth(leftWidth + delta);
		else rightWidth = clampWidth(rightWidth + delta);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>VN-DRAW: Vietnam Drought Risk Assessment and Warning</title>
</svelte:head>

<div class="app-shell">
	<Header />

	<div class="app-body" style="--left-col: {leftWidth}px; --right-col: {rightWidth}px">
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

		{#if isMapRoute}
			<!-- WAI-ARIA "window splitter" pattern: a focusable separator is the
			     documented way to make a draggable divider keyboard-operable. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				class="resize-handle left"
				role="separator"
				aria-orientation="vertical"
				aria-label="Resize indicator panel"
				aria-valuenow={leftWidth}
				aria-valuemin={MIN_PANE_WIDTH}
				aria-valuemax={MAX_PANE_WIDTH}
				tabindex="0"
				onpointerdown={(e) => startResize(e, 'left')}
				onkeydown={(e) => nudgeResize(e, 'left')}
			></div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				class="resize-handle right"
				role="separator"
				aria-orientation="vertical"
				aria-label="Resize legend panel"
				aria-valuenow={rightWidth}
				aria-valuemin={MIN_PANE_WIDTH}
				aria-valuemax={MAX_PANE_WIDTH}
				tabindex="0"
				onpointerdown={(e) => startResize(e, 'right')}
				onkeydown={(e) => nudgeResize(e, 'right')}
			></div>
		{/if}

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
		/* Indicator pane / map / legend pane widths, in px, set inline from
		   leftWidth/rightWidth ($state above) and dragged via .resize-handle.
		   The map takes whatever's left. */
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

	.resize-handle {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 10px;
		z-index: 2;
		cursor: col-resize;
		touch-action: none;
	}

	.resize-handle::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 50%;
		width: 2px;
		transform: translateX(-50%);
		background: transparent;
		transition: background-color 0.15s;
	}

	.resize-handle:hover::after,
	.resize-handle:focus-visible::after {
		background: var(--accent);
	}

	.resize-handle.left {
		left: calc(var(--left-col) - 5px);
	}

	.resize-handle.right {
		right: calc(var(--right-col) - 5px);
	}

	.page-layer {
		position: absolute;
		inset: 0;
		overflow-y: auto;
		background: var(--surface-2);
	}
</style>
