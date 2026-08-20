import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { RequestHandler } from './$types';

// Runs at build time (see src/routes/+layout.ts) and its output is written to
// a static file — GitHub Pages has no server to run this on request.
export const prerender = true;

// Streams the user's own pre-processed CSV from /downloads verbatim (read-only).
export const GET: RequestHandler = async () => {
	const filePath = path.resolve(
		process.cwd(),
		'downloads',
		'data_DRI',
		'Constant_yearlyDRI15to22.csv'
	);
	const csv = await readFile(filePath, 'utf-8');
	return new Response(csv, {
		headers: {
			'content-type': 'text/csv',
			'content-disposition': 'attachment; filename="VN-DRAW_DRI_2015-2022.csv"'
		}
	});
};
