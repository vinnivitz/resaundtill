<script>
	//@ts-nocheck
	import dayjs from 'dayjs';
	import { setContext } from 'svelte';

	import { calendar as calendarDefaults } from '../config/defaults';
	import { keyControlsContextKey, storeContextKey } from '../context';
	import datepickerStore from '../stores/datepicker';

	import Calendar from './calendar/Calendar.svelte';
	import CrossfadeBoundary from './generic/crossfade/CrossfadeBoundary.svelte';
	import Theme from './generic/Theme.svelte';
	import { derived, writable } from 'svelte/store';

	export let selected = calendarDefaults.selected;
	export let start = calendarDefaults.start;
	export let end = calendarDefaults.end;
	export let format = calendarDefaults.format;
	export let formatted = '';
	export let theme = {};
	export let defaultTheme = undefined;
	export let startOfWeekIndex = 0;
	export let store = datepickerStore.get({ selected, start, end, startOfWeekIndex });

	const focused = writable(false);

	setContext(storeContextKey, store);
	setContext(
		keyControlsContextKey,
		derived([store, focused], ([$s, $focused]) => ($focused ? $s.activeView : undefined))
	);

	const getFocusSetter = (bool) => () => focused.set(bool);

	$: selected = $store.selected;
	$: formatted = dayjs(selected).format(format);
</script>

<CrossfadeBoundary>
	<Theme {defaultTheme} {theme} let:style>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			{style}
			on:focus={getFocusSetter(true)}
			on:blur={getFocusSetter(false)}
			on:mouseover={getFocusSetter(true)}
			on:mouseout={getFocusSetter(false)}
		>
			<Calendar />
		</div>
	</Theme>
</CrossfadeBoundary>

<style>
	div {
		display: inline-block;
	}
</style>
