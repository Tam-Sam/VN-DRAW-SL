import { error } from '@sveltejs/kit';
import { loadGeoJsonSource, geoJsonResponse } from '$lib/server/geojson-source';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

// DHI ships as one file per year (monthly columns inside each), unlike the
// single combined files for DRI/DEI/DVI — the qgis2web layer-id suffix
// (_11, _10, ...) just reflects export order, not anything meaningful.
const FILE_BY_YEAR: Record<string, string> = {
	'2015': 'DHI_2015_11.js',
	'2016': 'DHI_2016_10.js',
	'2017': 'DHI_2017_9.js',
	'2018': 'DHI_2018_8.js',
	'2019': 'DHI_2019_7.js',
	'2020': 'DHI_2020_6.js',
	'2021': 'DHI_2021_5.js',
	'2022': 'DHI_2022_4.js'
};

export const entries: EntryGenerator = () => Object.keys(FILE_BY_YEAR).map((year) => ({ year }));

export const GET: RequestHandler = async ({ params }) => {
	const filename = FILE_BY_YEAR[params.year];
	if (!filename) error(404, `No DHI data for year ${params.year}`);
	return geoJsonResponse(await loadGeoJsonSource(filename));
};
