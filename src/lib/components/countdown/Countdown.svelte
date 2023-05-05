<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/countdown/Card.svelte';
	import { _ } from 'svelte-i18n';

	export let date = new Date(new Date().setDate(new Date().getDate() + 7));

	let show = false;

	// Set default values to 9 days
	let time = {
		days: 9,
		hours: 0,
		minutes: 0,
		seconds: 0
	};

	const handleTick = () => {
		const currentDate = new Date();
		const gap = date.getTime() - currentDate.getTime();

		const getDays = Math.floor(gap / (1000 * 60 * 60 * 24));
		const getHours = Math.floor((gap / (1000 * 60 * 60)) % 24);
		const getMinutes = Math.floor((gap / 1000 / 60) % 60);
		const getSeconds = Math.floor((gap / 1000) % 60);

		time.days = getDays;
		time.hours = getHours;
		time.minutes = getMinutes;
		time.seconds = getSeconds;
	};

	onMount(() => {
		handleTick();
		show = true;
	});
</script>

{#if show}
	<div class="flex flex-column gap-5 opacity-90">
		<Card callback={handleTick} name={$_('components.countdown.days')} number={time.days} />
		<Card callback={handleTick} name={$_('components.countdown.hours')} number={time.hours} />
		<Card callback={handleTick} name={$_('components.countdown.minutes')} number={time.minutes} />
		<Card callback={handleTick} name={$_('components.countdown.seconds')} number={time.seconds} />
	</div>
{/if}
