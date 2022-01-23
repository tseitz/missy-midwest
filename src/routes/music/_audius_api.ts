import type { Locals } from '$lib/types';

import type {
	EndpointOutput,
	Request
} from '@sveltejs/kit';

const base = 'https://discoveryprovider.audius.co/v1';
const siteName = 'missyswebsite';
export const userId = 'R9GRG';

export async function audiusApi(
	request: Request<Locals>,
	resource: string,
	data?: Record<string, unknown>
): Promise<EndpointOutput> {
	const res = await fetch(`${base}/${resource}?app_name=${siteName}`, {
		method: request.method,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: data && JSON.stringify(data)
	});

	console.log(res);

	return {
		status: res.status,
		body: await res.json()
	};
}
