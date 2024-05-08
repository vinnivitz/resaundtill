<script lang="ts">
	import { Locale } from '$lib/models';
	import { getLocale } from '$lib/utils';
	import { locale } from 'svelte-i18n';
</script>

<img
	class="h-7 w-10 cursor-pointer object-cover opacity-80 transition-all duration-300 hover:opacity-100"
	src={getLocale($locale) === Locale.DE ? '/images/locale/uk-flag.svg' : '/images/locale/german-flag.svg'}
	alt="Locale Switcher"
/>
