import { listGroups } from '$lib/server/catalog';
import { SHOP_ENABLED } from '$lib/shop/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	if (!SHOP_ENABLED) {
		return { shopEnabled: false as const, groups: [], loadError: false };
	}
	const { groups, error } = await listGroups();
	return { shopEnabled: true as const, groups, loadError: Boolean(error) };
};
