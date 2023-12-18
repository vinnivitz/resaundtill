<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { PageData } from '../about/$types';
	import { locale } from 'svelte-i18n';
	import { getTranslation } from '$lib/utils';
	import type { SupportTranslation } from '$lib/sdk/types';

	export let data: PageData;

	function getSupportTranslation(
		translations: SupportTranslation[],
		locale: string | null | undefined
	): SupportTranslation | undefined {
		return getTranslation<SupportTranslation>(translations, locale);
	}
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="pt-12 pl-5 pr-5 md:pl-12 md:pr-12 pb-5 md:pb-12 text-lg font-normal">
	{@html getSupportTranslation(data.supportInfo.translations, $locale)?.content}
</section>
