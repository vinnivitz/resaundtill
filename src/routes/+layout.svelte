<script lang="ts">
	import '$lib/locale';
	import { LayoutTheme, Locale } from '$lib/models';
	import { getLocale } from '$lib/utils';
	import { onMount } from 'svelte';

	import { locale } from 'svelte-i18n';
	import '../app.pcss';
	import Navbar from '$lib/components/Navbar.svelte';
	import '/node_modules/flag-icons/css/flag-icons.min.css';
	import { dataStore } from '$lib/stores/data.store';

	let toggleTheme: () => void;
	let toggleLocale: () => void;
	let isDark: boolean;

	onMount(() => {
		dataStore.init();
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

<header class="fixed left-0 right-0 top-0 z-40">
	<Navbar {isDark} on:locale={toggleLocale} on:theme={toggleTheme} />
</header>

<main class="relative z-0 h-screen overflow-scroll bg-gradient-to-b from-gray-200 to-20% pb-5 dark:from-gray-800">
	<slot />
</main>

<!-- {#if $isLoading || (browser && $navigating)}
	<div class="flex h-screen items-center justify-center">
		<Spinner size="24" color="blue" />
	</div>
{:else}
{/if} -->

<style lang="postcss">
	main {
		padding-top: calc(var(--nav-height));

		-ms-overflow-style: none;
		scrollbar-width: none;

		@media only screen and (max-width: 726px) {
			padding-top: var(--nav-height-mobile);
		}
	}

	main::-webkit-scrollbar {
		display: none;
	}
</style>
