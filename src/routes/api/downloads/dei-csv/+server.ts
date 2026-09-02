import { csvResponse } from '$lib/server/csv-source';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () =>
	csvResponse(['data_DEI', 'DEI15to22_EW.csv'], 'VN-DRAW_DEI_2015-2022.csv');
