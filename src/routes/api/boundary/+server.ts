import { loadGeoJsonSource, geoJsonResponse } from '$lib/server/geojson-source';
import type { RequestHandler } from './$types';

// Vietnam's new 34-province boundary (2025 merger) — outline reference layer
// only, no drought indicator data is joined to it yet.
export const prerender = true;

export const GET: RequestHandler = async () =>
	geoJsonResponse(await loadGeoJsonSource('vnm_admin_new_3.js'));
