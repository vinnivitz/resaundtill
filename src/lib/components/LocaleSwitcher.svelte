<script lang="ts">
	import { locale } from 'svelte-i18n';

	import { Locale } from '$lib/models';
	import { getLocale } from '$lib/utils';

	import { browser } from '$app/environment';

	let flagUrl = $derived(
		getLocale($locale) === Locale.DE ? '/images/locale/uk-flag.svg' : '/images/locale/german-flag.svg'
	);
</script>

{#if browser}
	<img
		class="h-7 w-10 cursor-pointer object-cover opacity-80 transition-all duration-300 hover:opacity-100"
		src={flagUrl}
		alt="Locale Switcher"
	/>
{/if}
