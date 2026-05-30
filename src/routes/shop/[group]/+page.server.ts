import { error } from '@sveltejs/kit';
import { getGroup } from '$lib/server/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const group = await getGroup(params.group);
	if (!group) {
		error(404, 'Product not found');
	}
	return { group };
};
