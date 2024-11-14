<script lang="ts">
	import { locale } from 'svelte-i18n';

	import type { CountryEntry, CountryEntryTranslation } from '$lib/models';
	import { getTranslation } from '$lib/utils';

	import 'flag-icons/css/flag-icons.min.css';

	export let item: CountryEntry;

	function getCountriesTranslation(
		translations: CountryEntryTranslation[],
		locale: string | null | undefined
	): CountryEntryTranslation | undefined {
		return getTranslation<CountryEntryTranslation>(translations, locale);
	}
</script>

<div class="rounded border p-6 transition-transform duration-300 hover:scale-110">
	<div class="flex gap-2">
		<span class={`fi fi-${item.code}`}></span>
		<h1>{getCountriesTranslation(item.translations, $locale)?.name}</h1>
	</div>
	<hr />
</div>
