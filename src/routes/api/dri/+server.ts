import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { RequestHandler } from './$types';

// Reads the pre-processed qgis2web export in /data (owned by the user, never
// modified here) and strips its `var json_DRI_2020_1 = ...;` JS wrapper so it
// can be served as plain JSON. Cached in memory after the first read since the
// source file is ~17MB and never changes at runtime.
let cached: string | null = null;

export const GET: RequestHandler = async () => {
	if (!cached) {
		const filePath = path.resolve(process.cwd(), 'data', 'DRI_2020_1.js');
		const raw = await readFile(filePath, 'utf-8');
		cached = raw.replace(/^var\s+json_DRI_2020_1\s*=\s*/, '').replace(/;\s*$/, '');
	}
	return new Response(cached, {
		headers: {
			'content-type': 'application/json',
			'cache-control': 'public, max-age=3600'
		}
	});
};
