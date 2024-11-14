<script lang="ts">
	import { fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="p-5 font-normal md:p-10">
	<h1 class="text-3xl">{$_('legals.title')}</h1>
	<h3 class=" mt-5 text-xl">{$_('legals.content-liability.title')}</h3>
	<p class="mt-3">
		{$_('legals.content-liability.content')}
	</p>
	<h3 class="mt-5 text-xl">{$_('legals.link-liability.title')}</h3>
	<p class="mt-3">
		{$_('legals.link-liability.content')}
	</p>
	<h3 class="mt-5 text-xl">{$_('legals.copyright.title')}</h3>
	<p class="mt-3">
		{$_('legals.copyright.content')}
	</p>
	<h1 class="mt-5 text-3xl">{$_('legals.privacy.title')}</h1>
	<p class="mt-3">
		{$_('legals.privacy.content')}
	</p>
</section>
