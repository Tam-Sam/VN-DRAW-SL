// Shared types + pure helpers for the drought indicator choropleths.
// Field names below were verified directly against the qgis2web exports in /data
// (data/DRI_2020_1.js, data/DEI_15_22_13.js, data/DVI_15_22_12.js, data/DHI_<year>_*.js).

export interface DriProperties {
	ADM1_EN: string;
	ADM1_VI: string;
	[key: string]: unknown;
}

export type DriFeature = GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon, DriProperties>;
export type DriFeatureCollection = GeoJSON.FeatureCollection<
	GeoJSON.MultiPolygon | GeoJSON.Polygon,
	DriProperties
>;

export type IndicatorId = 'dri' | 'dhi' | 'dei' | 'dvi';

// The full span data actually exists for. DRI is missing 2016 entirely (see
// availableYears); DHI has one file per year here, DEI/DVI have every year.
export const ALL_YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];

export interface IndicatorDef {
	id: IndicatorId;
	label: string;
	/** DHI is monthly (one source file per year); DRI/DEI/DVI are yearly. */
	monthly: boolean;
	fieldFor: (year: number, month?: number) => string;
}

export const INDICATORS: IndicatorDef[] = [
	{
		id: 'dri',
		label: 'Drought Risk (DRI)',
		monthly: false,
		fieldFor: (year) => `Constant_yearlyDRI15to22_DRI${year}`
	},
	{
		id: 'dhi',
		label: 'Drought Hazard (DHI)',
		monthly: true,
		fieldFor: (year, month) => `DHI${year}_DHI${year}${String(month ?? 12).padStart(2, '0')}`
	},
	{
		id: 'dei',
		label: 'Drought Exposure (DEI)',
		monthly: false,
		fieldFor: (year) => `DEI15to22_EW_DEI_${year}`
	},
	{
		id: 'dvi',
		label: 'Drought Vulnerability (DVI)',
		monthly: false,
		fieldFor: (year) => `DVI15to22_PCA_DVI_${year}`
	}
];

const INDICATOR_BY_ID: Record<IndicatorId, IndicatorDef> = Object.fromEntries(
	INDICATORS.map((ind) => [ind.id, ind])
) as Record<IndicatorId, IndicatorDef>;

export function indicatorField(indicator: IndicatorId, year: number, month?: number): string {
	return INDICATOR_BY_ID[indicator].fieldFor(year, month);
}

export function indicatorValue(
	props: DriProperties,
	indicator: IndicatorId,
	year: number,
	month?: number
): number | null {
	const v = props[indicatorField(indicator, year, month)];
	return typeof v === 'number' ? v : null;
}

// Which years actually have data for this indicator in the given dataset
// (DRI's 2016 column exists but is null for every province, for example).
export function availableYears(fc: DriFeatureCollection, indicator: IndicatorId): number[] {
	return ALL_YEARS.filter((year) =>
		fc.features.some((f) => indicatorValue(f.properties, indicator, year) != null)
	);
}

// Matches each indicator's field-naming convention exactly, so a scan over a
// loaded FeatureCollection's own property keys can find every year/month
// column that belongs to it — without needing to be told which years/months
// are actually present in the file (used by continuousDomain below).
const FIELD_PATTERNS: Record<IndicatorId, RegExp> = {
	dri: /^Constant_yearlyDRI15to22_DRI\d{4}$/,
	dhi: /^DHI\d{4}_DHI\d{6}$/,
	dei: /^DEI15to22_EW_DEI_\d{4}$/,
	dvi: /^DVI15to22_PCA_DVI_\d{4}$/
};

export interface RiskClass {
	label: string;
	color: string;
	min: number;
	max: number;
}

// Breakpoints + colors match the original qgis2web style function exactly
// (ColorBrewer RdYlGn, 5-class), so the map reads identically to the legacy export.
const DRI_CLASSES: RiskClass[] = [
	{ label: 'Very Low', color: '#1a9641', min: -Infinity, max: 0.3 },
	{ label: 'Low', color: '#a6d96a', min: 0.3, max: 0.4 },
	{ label: 'Moderate', color: '#ffffc0', min: 0.4, max: 0.5 },
	{ label: 'High', color: '#fdae61', min: 0.5, max: 0.6 },
	{ label: 'Very High', color: '#d7191c', min: 0.6, max: Infinity }
];

export function riskClassFor(value: number | null): RiskClass | null {
	if (value == null) return null;
	return (
		DRI_CLASSES.find((c) => value >= c.min && value < c.max) ?? DRI_CLASSES[DRI_CLASSES.length - 1]
	);
}

export function driRiskClasses(): RiskClass[] {
	return DRI_CLASSES;
}

// DHI/DEI/DVI use a continuous green→red gradient instead of DRI's discrete
// 5-class breakpoints — no classification thresholds needed. The stops reuse
// DRI's exact palette for visual consistency across all four indicators.
const CONTINUOUS_STOPS = ['#1a9641', '#a6d96a', '#ffffc0', '#fdae61', '#d7191c'];

function hexToRgb(hex: string): [number, number, number] {
	const n = parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixHex(a: string, b: string, t: number): string {
	const [ar, ag, ab] = hexToRgb(a);
	const [br, bg, bb] = hexToRgb(b);
	const mix = (x: number, y: number) => Math.round(x + (y - x) * t);
	return (
		'#' +
		[mix(ar, br), mix(ag, bg), mix(ab, bb)].map((v) => v.toString(16).padStart(2, '0')).join('')
	);
}

// t is the value's position in [0, 1] along the gradient (see continuousDomain).
export function continuousColor(t: number): string {
	const clamped = Math.min(1, Math.max(0, t));
	const segments = CONTINUOUS_STOPS.length - 1;
	const scaled = clamped * segments;
	const i = Math.min(segments - 1, Math.floor(scaled));
	return mixHex(CONTINUOUS_STOPS[i], CONTINUOUS_STOPS[i + 1], scaled - i);
}

export function continuousStops(): string[] {
	return CONTINUOUS_STOPS;
}

const RELATIVE_LABELS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];

// A descriptive label for where a value sits along the gradient — computed
// from its relative position, not a fixed absolute threshold (there isn't one
// for these three indicators), same 5 names as DRI's classes for consistency.
export function relativeLabel(t: number): string {
	return RELATIVE_LABELS[Math.min(4, Math.floor(Math.min(1, Math.max(0, t)) * 5))];
}

export interface Domain {
	min: number;
	max: number;
}

// The true min/max across every year/month column this indicator occupies in
// the CURRENTLY LOADED file (all 8 years for DRI/DEI/DVI; all 12 months of
// whichever year is loaded for DHI) — not just the one year/month on screen —
// so the color scale stays stable as you move through years/months instead of
// visually rescaling every time.
export function continuousDomain(fc: DriFeatureCollection, indicator: IndicatorId): Domain {
	const pattern = FIELD_PATTERNS[indicator];
	let min = Infinity;
	let max = -Infinity;
	for (const f of fc.features) {
		for (const [key, v] of Object.entries(f.properties)) {
			if (typeof v !== 'number' || !pattern.test(key)) continue;
			if (v < min) min = v;
			if (v > max) max = v;
		}
	}
	return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : { min: 0, max: 1 };
}

export interface RiskInfo {
	color: string;
	label: string;
}

// Unified color+label lookup for the map/popup/legend: DRI uses its fixed
// discrete classes; DHI/DEI/DVI interpolate continuously across `domain`.
export function riskInfoFor(
	value: number | null,
	indicator: IndicatorId,
	domain: Domain | null
): RiskInfo | null {
	if (value == null) return null;
	if (indicator === 'dri') {
		const cls = riskClassFor(value);
		return cls ? { color: cls.color, label: cls.label } : null;
	}
	if (!domain) return null;
	const span = domain.max - domain.min || 1;
	const t = (value - domain.min) / span;
	return { color: continuousColor(t), label: relativeLabel(t) };
}
