import { error } from '@sveltejs/kit';
import { SDK, auth } from '$lib/sdk';
import type { PageLoad } from '../$types';
import type { SupportInfoEntry } from '$lib/sdk/types';

export const load: PageLoad = async () => {
	await auth();

	const response = await SDK.items('support').readByQuery();

	if (!response.data) throw error(500);

	const supportInfo: SupportInfoEntry = response.data as unknown as SupportInfoEntry;

	return { supportInfo };
};
