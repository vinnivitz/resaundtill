import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => ({ postId: params.slug });
