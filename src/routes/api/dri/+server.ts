import { loadGeoJsonSource, geoJsonResponse } from '$lib/server/geojson-source';
import type { RequestHandler } from './$types';

// Runs at build time (see src/routes/+layout.ts) and its output is written to
// a static /api/dri file — GitHub Pages has no server to run this on request.
export const prerender = true;

export const GET: RequestHandler = async () =>
	geoJsonResponse(await loadGeoJsonSource('DRI_2020_1.js'));
