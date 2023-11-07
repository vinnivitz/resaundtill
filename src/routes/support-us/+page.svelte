<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { PageData } from './$types';
	import { locale } from 'svelte-i18n';
	import { getTranslationIdx } from '$lib/utils';

	export let data: PageData;
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="pt-12 pl-5 pr-5 md:pl-12 md:pr-12 pb-5 md:pb-12 text-lg font-normal">
	{@html data.supportInfo.translations[getTranslationIdx($locale)].content}
</section>
