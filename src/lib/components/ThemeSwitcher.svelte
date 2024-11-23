<script lang="ts">
	import { Icon } from 'svelte-icons-pack';
	import { FaSolidMoon, FaSolidSun } from 'svelte-icons-pack/fa';

	let { isDark }: { isDark: boolean } = $props();
</script>

<div class="relative h-4 w-10 cursor-pointer rounded-full bg-gray-300">
	<div
		class="absolute -top-[4px] -mt-[2px] rounded-full bg-gray-200 p-[2px] text-amber-300 shadow-xl transition-all duration-300 dark:-mt-1 dark:bg-gray-800 dark:text-gray-200"
		class:-left-1={!isDark}
		class:left-4={isDark}
	>
		{#if isDark}
			<Icon src={FaSolidMoon} size="28"></Icon>
		{:else}
			<Icon src={FaSolidSun} size="26"></Icon>
		{/if}
	</div>
</div>
