<script lang="ts">
	import '../app.postcss';
	import Navbar from '$lib/components/Navbar.svelte';
	import { browser } from '$app/environment';
	import '$lib/locale';
	import { _, locale, waitLocale } from 'svelte-i18n';
	import type { LayoutData, PageData, PageLoad } from './$types';
	import Footer from '$lib/components/Footer.svelte';
	import { isLoading } from 'svelte-i18n';
	import { Spinner } from 'flowbite-svelte';
	import { navigating } from '$app/stores';
	import Countdown from '$lib/components/countdown/Countdown.svelte';
	import { SDK, auth } from '$lib/sdk';
	import { error } from '@sveltejs/kit';

	let departure: Date;

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
		class="h-screen relative z-0 bg-gradient-to-b from-gray-200 to-transparent to-20% dark:from-gray-800 overflow-scroll scrollbar-hide pb-5"
	>
		<slot />
	</main>

	<Footer />
{/if}

<style lang="postcss">
	main {
		padding-top: var(--nav-height);
	}
</style>
