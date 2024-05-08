<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { PageData } from '../about/$types';
	import { locale } from 'svelte-i18n';
	import { getTranslation } from '$lib/utils';
	import type { SupportTranslation } from '$lib/models';

	export let data: PageData;

	function getSupportTranslation(
		translations: SupportTranslation[],
		locale: string | null | undefined
	): SupportTranslation | undefined {
		return getTranslation<SupportTranslation>(translations, locale);
	}
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="pb-5 pl-5 pr-5 pt-12 text-lg font-normal md:pb-12 md:pl-12 md:pr-12">
	{@html getSupportTranslation(data.supportInfo.translations, $locale)?.content}
</section>
