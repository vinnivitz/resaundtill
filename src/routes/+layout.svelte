<script lang="ts">
	import '../app.postcss';
	import Navbar from '$lib/components/Navbar.svelte';
	import '$lib/locale';
	import { _, locale } from 'svelte-i18n';
	import Footer from '$lib/components/Footer.svelte';
	import { isLoading } from 'svelte-i18n';
	import { Spinner } from 'flowbite-svelte';
	import { navigating } from '$app/stores';
	import { LayoutTheme, Locale } from '$lib/models/user.model';
	import { getLocale } from '$lib/utils/locale.util';
	import { onMount } from 'svelte';

	let toggleTheme: () => void;
	let toggleLocale: () => void;
	let isDark: boolean;

	onMount(() => {
		isDark =
			localStorage.getItem('color-theme') === LayoutTheme.DARK ||
			(!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
		isDark
			? window.document.documentElement.classList.add(LayoutTheme.DARK)
			: window.document.documentElement.classList.remove(LayoutTheme.DARK);
		toggleTheme = () => {
			isDark = window.document.documentElement.classList.toggle('dark');
			localStorage.setItem('color-theme', isDark ? LayoutTheme.DARK : LayoutTheme.LIGHT);
		};
		toggleLocale = () => {
			locale.set(getLocale($locale) === Locale.DE ? Locale.EN : Locale.DE);
			localStorage.setItem('locale', getLocale($locale));
		};
	});
</script>

<svelte:head>
	<title>Resa und Till</title>
</svelte:head>

{#if $isLoading || $navigating}
	<div class="m-12 text-center mt-96 text-center flex flex-col items-center">
		<div class="flex-1">
			<Spinner size="24" />
		</div>
	</div>
{:else}
	<header class="fixed z-50 top-0 left-0 right-0">
		<Navbar {isDark} on:locale={toggleLocale} on:theme={toggleTheme} />
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
