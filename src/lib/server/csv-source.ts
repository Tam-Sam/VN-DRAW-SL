import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Streams the user's own pre-processed CSVs from /downloads verbatim (read-only).
export async function csvResponse(relativePath: string[], downloadName: string): Promise<Response> {
	const filePath = path.resolve(process.cwd(), 'downloads', ...relativePath);
	const csv = await readFile(filePath, 'utf-8');
	return new Response(csv, {
		headers: {
			'content-type': 'text/csv',
			'content-disposition': `attachment; filename="${downloadName}"`
		}
	});
}
