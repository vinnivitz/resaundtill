<script lang="ts">
	import { fly } from 'svelte/transition';
	import { locale } from 'svelte-i18n';

	import type { SupportTranslation } from '$lib/models';
	import { supportInfoStore } from '$lib/stores';
	import { getTranslation } from '$lib/utils';

	function getSupportTranslation(
		translations: SupportTranslation[],
		locale: string | null | undefined
	): SupportTranslation | undefined {
		return getTranslation<SupportTranslation>(translations, locale);
	}
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="pb-5 pl-5 pr-5 pt-12 text-lg font-normal md:pb-12 md:pl-12 md:pr-12">
	{@html getSupportTranslation($supportInfoStore?.translations ?? [], $locale)?.content}
</section>
