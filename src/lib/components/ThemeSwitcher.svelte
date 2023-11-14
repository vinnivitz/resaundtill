<script lang="ts">
	// @ts-ignore
	import FaSun from 'svelte-icons/fa/FaSun.svelte';
	// @ts-ignore
	import FaMoon from 'svelte-icons/fa/FaMoon.svelte';

	export let isDark: boolean;
</script>

<div class="relative h-4 w-12 rounded-full bg-gray-300 cursor-pointer">
	<div
		class="absolute h-8 w-8 -top-2 bg-gray-200 rounded-full bg-white p-[0.1rem] shadow-xl shadow-inner text-amber-300 dark:bg-gray-800 dark:text-gray-200 transition-all duration-300"
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
