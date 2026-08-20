// Shared types + pure helpers for the DRI (Drought Risk Index) choropleth.
// Field names match the qgis2web-exported properties in data/DRI_2020_1.js verbatim.

export interface DriProperties {
	ADM1_EN: string;
	ADM1_VI: string;
	ADM1_PCODE: string;
	[key: `Constant_yearlyDRI15to22_DRI${number}`]: number | null;
	[key: string]: unknown;
}

export type DriFeature = GeoJSON.Feature<GeoJSON.MultiPolygon | GeoJSON.Polygon, DriProperties>;
export type DriFeatureCollection = GeoJSON.FeatureCollection<
	GeoJSON.MultiPolygon | GeoJSON.Polygon,
	DriProperties
>;

export const YEAR_FIELD_PREFIX = 'Constant_yearlyDRI15to22_DRI';

// The composite DRI is the only indicator actually present in the current
// export (see data/DRI_2020_1.js). DHI/DEI/DVI are wired up below so the map
// and UI can switch layers, but their field prefixes are placeholders until a
// dataset containing those columns is published — until then `indicatorValue`
// simply returns null for them, same as any other missing year/column.
export type IndicatorId = 'dri' | 'dhi' | 'dei' | 'dvi';

export interface IndicatorDef {
	id: IndicatorId;
	label: string;
	fieldPrefix: string;
}

export const INDICATORS: IndicatorDef[] = [
	{ id: 'dri', label: 'Drought Risk (DRI)', fieldPrefix: YEAR_FIELD_PREFIX },
	{ id: 'dhi', label: 'Drought Hazard (DHI)', fieldPrefix: 'Constant_yearlyDHI15to22_DHI' },
	{ id: 'dei', label: 'Drought Exposure (DEI)', fieldPrefix: 'Constant_yearlyDEI15to22_DEI' },
	{ id: 'dvi', label: 'Drought Vulnerability (DVI)', fieldPrefix: 'Constant_yearlyDVI15to22_DVI' }
];

const INDICATOR_BY_ID: Record<IndicatorId, IndicatorDef> = Object.fromEntries(
	INDICATORS.map((ind) => [ind.id, ind])
) as Record<IndicatorId, IndicatorDef>;

export function indicatorYearField(indicator: IndicatorId, year: number): string {
	return `${INDICATOR_BY_ID[indicator].fieldPrefix}${year}`;
}

export function indicatorValue(
	props: DriProperties,
	indicator: IndicatorId,
	year: number
): number | null {
	const v = props[indicatorYearField(indicator, year)];
	return typeof v === 'number' ? v : null;
}

// Year range is driven by the DRI columns specifically, since that's the only
// indicator guaranteed to be present — every layer shares this same range.
export function availableYears(fc: DriFeatureCollection): number[] {
	const first = fc.features[0]?.properties;
	if (!first) return [];
	const years = Object.keys(first)
		.filter((k) => k.startsWith(YEAR_FIELD_PREFIX))
		.map((k) => Number(k.slice(YEAR_FIELD_PREFIX.length)))
		.filter((year) => fc.features.some((f) => indicatorValue(f.properties, 'dri', year) != null));
	return years.sort((a, b) => a - b);
}

export interface RiskClass {
	label: string;
	color: string;
	min: number;
	max: number;
}

// Breakpoints + colors match the original qgis2web style function exactly
// (ColorBrewer RdYlGn, 5-class), so the new map reads identically to the legacy export.
export const RISK_CLASSES: RiskClass[] = [
	{ label: 'Very Low', color: '#1a9641', min: -Infinity, max: 0.3 },
	{ label: 'Low', color: '#a6d96a', min: 0.3, max: 0.4 },
	{ label: 'Moderate', color: '#ffffc0', min: 0.4, max: 0.5 },
	{ label: 'High', color: '#fdae61', min: 0.5, max: 0.6 },
	{ label: 'Very High', color: '#d7191c', min: 0.6, max: Infinity }
];

export function riskClassFor(value: number | null): RiskClass | null {
	if (value == null) return null;
	return (
		RISK_CLASSES.find((c) => value >= c.min && value < c.max) ??
		RISK_CLASSES[RISK_CLASSES.length - 1]
	);
}
