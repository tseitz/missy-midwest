import { error, redirect } from '@sveltejs/kit';
import { getGroup } from '$lib/server/catalog';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	if (!SHOP_ENABLED) redirect(307, '/shop');
	const group = await getGroup(params.group);
	if (!group) {
		error(404, 'Product not found');
	}
	return { group };
};
