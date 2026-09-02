import { csvResponse } from '$lib/server/csv-source';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () =>
	csvResponse(['data_DVI', 'DVI15to22_PCA.csv'], 'VN-DRAW_DVI_2015-2022.csv');
