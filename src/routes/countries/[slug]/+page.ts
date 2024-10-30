import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => ({ countryId: params.slug });
