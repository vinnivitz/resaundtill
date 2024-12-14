<script lang="ts">
	import { fly } from 'svelte/transition';
	import { t } from 'svelte-i18n';

	import Footer from '$lib/components/Footer.svelte';
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="p-5 pb-10 font-normal md:p-10">
	<h1 class="text-3xl">{$t('legals.title')}</h1>
	<h3 class=" mt-5 text-xl">{$t('legals.content-liability.title')}</h3>
	<p class="mt-3">
		{$t('legals.content-liability.content')}
	</p>
	<h3 class="mt-5 text-xl">{$t('legals.link-liability.title')}</h3>
	<p class="mt-3">
		{$t('legals.link-liability.content')}
	</p>
	<h3 class="mt-5 text-xl">{$t('legals.copyright.title')}</h3>
	<p class="mt-3">
		{$t('legals.copyright.content')}
	</p>
	<h1 class="mt-5 text-3xl">{$t('legals.privacy.title')}</h1>
	<p class="mt-3">
		{$t('legals.privacy.content')}
	</p>
</section>
<div class="absolute bottom-4 left-0 right-0 w-full">
	<Footer></Footer>
</div>
