<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	import Card from '$lib/components/countdown/Card.svelte';

	let { date }: { date: Date | null } = $props();

	let show = $state(false);

	// Set default values to 9 days
	let time = {
		days: 9,
		hours: 0,
		minutes: 0,
		seconds: 0
	};

	function handleTick(): void {
		const currentDate = new Date();
		const gap = (date?.getTime() ?? 0) - currentDate.getTime();

		const getDays = Math.floor(gap / (1000 * 60 * 60 * 24));
		const getHours = Math.floor((gap / (1000 * 60 * 60)) % 24);
		const getMinutes = Math.floor((gap / 1000 / 60) % 60);
		const getSeconds = Math.floor((gap / 1000) % 60);

		time.days = getDays;
		time.hours = getHours;
		time.minutes = getMinutes;
		time.seconds = getSeconds;
	}

	onMount(() => {
		handleTick();
		show = true;
	});
</script>

{#if show}
	<div class="flex-column flex scale-[0.85] transform gap-5 opacity-90">
		<Card callback={handleTick} name={$_('components.countdown.days')} number={time.days} />
		<Card callback={handleTick} name={$_('components.countdown.hours')} number={time.hours} />
		<Card callback={handleTick} name={$_('components.countdown.minutes')} number={time.minutes} />
		<Card callback={handleTick} name={$_('components.countdown.seconds')} number={time.seconds} />
	</div>
{/if}
