<script lang="ts">
	// @ts-ignore
	import FaSun from 'svelte-icons/fa/FaSun.svelte';
	// @ts-ignore
	import FaMoon from 'svelte-icons/fa/FaMoon.svelte';

	export let isDark: boolean;
</script>

<div class="relative h-4 w-12 cursor-pointer rounded-full bg-gray-300">
	<div
		class="absolute -top-2 h-8 w-8 rounded-full bg-gray-200 p-[0.1rem] text-amber-300 shadow-xl transition-all duration-300 dark:bg-gray-800 dark:text-gray-200"
		class:left-0={!isDark}
		class:left-4={isDark}
	>
		{#if isDark}
			<FaMoon />
		{:else}
			<FaSun />
		{/if}
	</div>
</div>
