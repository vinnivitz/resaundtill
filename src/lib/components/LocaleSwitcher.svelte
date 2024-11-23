<script lang="ts">
	import { locale } from 'svelte-i18n';

	import { Locale } from '$lib/models';
	import { getLocale } from '$lib/utils';

	import { browser } from '$app/environment';
</script>

{#if browser}
	<div
		class={`fi fi-${getLocale($locale) === Locale.DE ? 'gb' : 'de'} cursor-pointer text-2xl opacity-80 transition-all duration-300 hover:opacity-100`}
	></div>
{/if}
