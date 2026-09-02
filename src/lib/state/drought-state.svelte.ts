import { resolve } from '$app/paths';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import {
	availableYears,
	continuousDomain as computeContinuousDomain,
	ALL_YEARS,
	type DriFeatureCollection,
	type Domain,
	type IndicatorId
} from '$lib/dri';

export type Basemap = 'satellite' | 'street';

function cacheKey(indicator: IndicatorId, year: number): string {
	// DHI ships one file per year; DRI/DEI/DVI are each a single multi-year file,
	// so every year of theirs shares the same cache entry.
	return indicator === 'dhi' ? `dhi:${year}` : indicator;
}

function apiPathFor(indicator: IndicatorId, year: number): string {
	switch (indicator) {
		case 'dri':
			return resolve('/api/dri');
		case 'dei':
			return resolve('/api/dei');
		case 'dvi':
			return resolve('/api/dvi');
		case 'dhi':
			return resolve('/api/dhi/[year]', { year: String(year) });
	}
}

class DroughtState {
	// Loaded indicator datasets, keyed by cacheKey(). A reactive Map so the UI
	// updates as each indicator/year finishes loading; each FeatureCollection
	// itself is an opaque ~17-40MB value handed to components as-is, never
	// deeply proxied (that's what would make this genuinely slow).
	private datasets = new SvelteMap<string, DriFeatureCollection>();
	private loadingKeys = new SvelteSet<string>();
	private errorsByKey = new SvelteMap<string, string>();

	selectedIndicator = $state<IndicatorId>('dri');
	selectedYear = $state(2020);
	selectedMonth = $state(12); // DHI only
	selectedProvinceName = $state<string | null>(null);
	basemap = $state<Basemap>('satellite');

	// Vietnam's new 34-province boundary (2025 merger) — a plain outline
	// overlay, independent of whichever drought indicator is showing.
	showNewBoundary = $state(false);
	boundary = $state.raw<DriFeatureCollection | null>(null);
	private boundaryLoading = false;

	currentKey = $derived(cacheKey(this.selectedIndicator, this.selectedYear));
	currentData = $derived(this.datasets.get(this.currentKey) ?? null);
	loading = $derived(this.loadingKeys.has(this.currentKey));
	error = $derived(this.errorsByKey.get(this.currentKey) ?? null);

	// DHI has a fixed file per year (always the full range); DRI/DEI/DVI's
	// available years depend on which columns actually have data.
	years = $derived.by(() => {
		if (this.selectedIndicator === 'dhi') return ALL_YEARS;
		return this.currentData ? availableYears(this.currentData, this.selectedIndicator) : [];
	});

	// DHI/DEI/DVI's continuous color scale, min/max across every year/month
	// column in the currently loaded file (null for DRI, which uses fixed
	// discrete breakpoints instead — see riskInfoFor in $lib/dri).
	continuousDomain: Domain | null = $derived(
		this.selectedIndicator !== 'dri' && this.currentData
			? computeContinuousDomain(this.currentData, this.selectedIndicator)
			: null
	);

	// Set by MapView once the Leaflet instance exists, so other components
	// (header search) can drive the persistent map without MapView needing to
	// know about them. Provinces are matched by name (ADM1_EN) — the only
	// identifying field every indicator's export has in common.
	focusProvince: ((name: string) => void) | null = null;

	async ensureLoaded(indicator: IndicatorId, year: number) {
		const key = cacheKey(indicator, year);
		if (this.datasets.has(key) || this.loadingKeys.has(key)) return;
		this.loadingKeys.add(key);
		try {
			const res = await fetch(apiPathFor(indicator, year));
			if (!res.ok) throw new Error(`Failed to load ${indicator} data (${res.status})`);
			const fc = (await res.json()) as DriFeatureCollection;
			this.datasets.set(key, fc);
			if (this.years.length && !this.years.includes(this.selectedYear)) {
				this.selectedYear = this.years.at(-1)!;
			}
		} catch (err) {
			this.errorsByKey.set(
				key,
				err instanceof Error ? err.message : `Unknown error loading ${indicator}`
			);
		} finally {
			this.loadingKeys.delete(key);
		}
	}

	async loadBoundary() {
		if (this.boundary || this.boundaryLoading) return;
		this.boundaryLoading = true;
		try {
			const res = await fetch(resolve('/api/boundary'));
			if (res.ok) this.boundary = (await res.json()) as DriFeatureCollection;
		} finally {
			this.boundaryLoading = false;
		}
	}
}

export const droughtState = new DroughtState();
