import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Reads a qgis2web-exported `data/*.js` file (owned by the user, never
// modified here) and strips its `var json_X = ...;` JS wrapper so it can be
// served as plain JSON. Each caller keeps its own in-memory cache keyed by
// filename, since these files are ~17-40MB and never change at runtime.
const cache = new Map<string, string>();

export async function loadGeoJsonSource(filename: string): Promise<string> {
	const cached = cache.get(filename);
	if (cached) return cached;

	const filePath = path.resolve(process.cwd(), 'data', filename);
	const raw = await readFile(filePath, 'utf-8');
	const stripped = raw.replace(/^var\s+\w+\s*=\s*/, '').replace(/;\s*$/, '');
	cache.set(filename, stripped);
	return stripped;
}

export function geoJsonResponse(body: string): Response {
	return new Response(body, {
		headers: {
			'content-type': 'application/json',
			'cache-control': 'public, max-age=3600'
		}
	});
}
