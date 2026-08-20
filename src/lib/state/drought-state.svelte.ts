import { resolve } from '$app/paths';
import {
	availableYears,
	type DriFeatureCollection,
	type DriProperties,
	type IndicatorId
} from '$lib/dri';

export type Basemap = 'satellite' | 'street';

class DroughtState {
	// Raw (not deeply reactive) — this is a ~17MB nested GeoJSON structure and is
	// always replaced wholesale, never mutated in place.
	data = $state.raw<DriFeatureCollection | null>(null);
	loading = $state(true);
	error = $state<string | null>(null);

	years = $state<number[]>([]);
	selectedYear = $state(2020);
	selectedIndicator = $state<IndicatorId>('dri');
	selectedProvince = $state<DriProperties | null>(null);
	basemap = $state<Basemap>('satellite');

	// Set by MapView once the Leaflet instance exists, so other components
	// (header search, province list) can drive the persistent map without
	// MapView needing to know about them.
	focusProvince: ((pcode: string) => void) | null = null;

	async load() {
		if (this.data) return;
		try {
			const res = await fetch(resolve('/api/dri'));
			if (!res.ok) throw new Error(`Failed to load DRI data (${res.status})`);
			const fc = (await res.json()) as DriFeatureCollection;
			this.data = fc;
			this.years = availableYears(fc);
			if (this.years.length && !this.years.includes(this.selectedYear)) {
				this.selectedYear = this.years.at(-1)!;
			}
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Unknown error loading DRI data';
		} finally {
			this.loading = false;
		}
	}
}

export const droughtState = new DroughtState();
