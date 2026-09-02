import { loadGeoJsonSource, geoJsonResponse } from '$lib/server/geojson-source';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () =>
	geoJsonResponse(await loadGeoJsonSource('DEI_15_22_13.js'));
