<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { browser } from '$app/environment';
	import '$lib/locale';
	import { _, locale, waitLocale } from 'svelte-i18n';
	import type { LayoutData } from './$types';
	import '../app.postcss';
	import Footer from '$lib/components/Footer.svelte';
	import { isLoading } from 'svelte-i18n';
	import { Spinner } from 'flowbite-svelte';
	import { page } from '$app/stores';
	import { PagePath } from '$lib/models/router.model';
	import { navigating } from '$app/stores';
	import { fly } from 'svelte/transition';

	export const load: LayoutData = async () => {
		if (browser) {
			locale.set(window.navigator.language);
		}
		await waitLocale();
	};
</script>

{#if $isLoading || $navigating}
	<div class="m-12 text-center mt-96 text-center flex flex-col items-center">
		<div class="flex-1">
			<Spinner size="24" />
		</div>
	</div>
{:else}
	<header class="fixed z-50 top-0 left-0 right-0">
		<Navbar />
	</header>

	<main
		class="pt-16 md:pt-20 relative z-0 bg-gradient-to-b from-gray-200 to-transparent to-10% dark:from-gray-800 overflow-scroll scrollbar-hide"
	>
		<slot />
	</main>

	<Footer />
{/if}

<style lang="postcss">
	main {
		height: calc(100vh - 7rem);
	}
</style>
