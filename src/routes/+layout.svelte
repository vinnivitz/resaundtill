<script lang="ts">
	import '../app.postcss';
	import Navbar from '$lib/components/Navbar.svelte';
	import '$lib/locale';
	import { _, locale } from 'svelte-i18n';
	import Footer from '$lib/components/Footer.svelte';
	import { isLoading } from 'svelte-i18n';
	import { Spinner } from 'flowbite-svelte';
	import { navigating } from '$app/stores';
	import { Locale } from '$lib/models/user.model';

	let currentLocale: Locale;

	locale.subscribe((value) => (currentLocale = value as Locale));

	const toggleLocale = () => locale.set(currentLocale === Locale.de ? Locale.en : Locale.de);
</script>

{#if $isLoading || $navigating}
	<div class="m-12 text-center mt-96 text-center flex flex-col items-center">
		<div class="flex-1">
			<Spinner size="24" />
		</div>
	</div>
{:else}
	<header class="fixed z-50 top-0 left-0 right-0">
		<Navbar on:locale={toggleLocale} />
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

		@media only screen and (max-width: 726px) {
			padding-top: var(--nav-height-mobile);
		}
	}
</style>
