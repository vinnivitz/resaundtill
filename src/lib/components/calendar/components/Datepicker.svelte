<script>
	// @ts-nocheck
	import dayjs from 'dayjs';
	import { setContext } from 'svelte';

	import Calendar from '../components/calendar/Calendar.svelte';
	import Theme from '../components/generic/Theme.svelte';
	import Popover from '../components/Popover.svelte';
	import { calendar as calendarDefaults } from '../config/defaults';
	import { keyControlsContextKey, storeContextKey } from '../context';
	import datepickerStore from '../stores/datepicker';
	import { derived } from 'svelte/store';
	import { fade } from 'svelte/transition';

	export let selected = calendarDefaults.selected;
	export let start = calendarDefaults.start;
	export let end = calendarDefaults.end;
	export let format = calendarDefaults.format;
	export let formatted = '';
	export let theme = {};
	export let defaultTheme = undefined;
	export let startOfWeekIndex = 0;
	export let reset = false;
	export let store = datepickerStore.get({
		selected,
		start,
		end,
		shouldEnlargeDay: true,
		startOfWeekIndex
	});

	let initial = selected;

	setContext(storeContextKey, store);
	setContext(
		keyControlsContextKey,
		derived(store, ($s) => $s.activeView)
	);

	$: selected = $store.selected;
	$: formatted = dayjs(selected).format(format);

	$: {
		$store.start = start;
		$store.end = end;
	}
	$: if (reset) $store.selected = initial;
</script>

<Theme {defaultTheme} {theme} let:style>
	<Popover {style} let:key let:send let:receive bind:isOpen={$store.open}>
		<slot {key} {send} {receive} {formatted}>
			<div class="button-container">
				<button in:receive|local={{ key }} out:send|local={{ key }} aria-label="Open calendar"></button>
				<div class="flex pt-2">
					<span transition:fade|local={{ delay: 150 }} class="button-text">{formatted}</span>
				</div>
			</div>
		</slot>
		<svelte:fragment slot="contents">
			<Calendar />
		</svelte:fragment>
	</Popover>
</Theme>

<style>
	.button-container {
		display: grid;
	}
	.button-container > * {
		grid-column: 1;
		grid-row: 1;
		height: 100%;
	}
	button {
		margin-top: 7px;
		/* padding: 16px 30px; */
		background: var(--sc-theme-calendar-colors-background-primary);
		color: var(--sc-theme-calendar-colors-text-primary);
		font-size: 1.3em;
		border-radius: 2px;
		border: 0;
		box-shadow: 4px 3px 9px rgb(0 0 0 / 20%);
		cursor: pointer;
	}
	.button-text {
		padding-top: 10px;
		padding: 5px;
		padding-bottom: 0;
		color: var(--sc-theme-calendar-colors-text-primary);
		font-size: 1em;
		cursor: pointer;
	}
</style>
