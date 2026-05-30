import { listGroups } from '$lib/server/catalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { groups, error } = await listGroups();
	return { groups, loadError: Boolean(error) };
};
