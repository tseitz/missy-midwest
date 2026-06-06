import { redirect } from '@sveltejs/kit';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!SHOP_ENABLED) redirect(307, '/shop');
	return {};
};
