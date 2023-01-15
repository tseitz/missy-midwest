import type { PageLoad } from './$types';
import dates from '$lib/data/dates.json';

export const load = (() => {
  console.log(dates)
  return {
    dates
  };
}) satisfies PageLoad;