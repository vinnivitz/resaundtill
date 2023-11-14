<script lang="ts">
	import { Locale } from '$lib/models';
	import { getLocale } from '$lib/utils';
	import { locale } from 'svelte-i18n';
</script>

<img
	class="w-10 h-7 cursor-pointer object-cover opacity-80 hover:opacity-100 transition-all duration-300"
	src={getLocale($locale) === Locale.DE ? '/images/uk-flag.svg' : '/images/german-flag.svg'}
	alt=""
/>
