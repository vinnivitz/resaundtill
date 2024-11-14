<script lang="ts">
	import '$lib/locale';
	import { onMount } from 'svelte';
	import { locale } from 'svelte-i18n';

	import Navbar from '$lib/components/Navbar.svelte';
	import { LayoutTheme, Locale } from '$lib/models';
	import { getLocale } from '$lib/utils';

	import '/node_modules/flag-icons/css/flag-icons.min.css';
	import '../app.pcss';

	let isDark = $state(false);

	onMount(() => {
		isDark =
			localStorage.getItem('color-theme') === LayoutTheme.DARK ||
			(!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

		document.documentElement.classList.toggle(LayoutTheme.DARK, isDark);
	});

	function toggleTheme(): void {
		isDark = !isDark;
		document.documentElement.classList.toggle(LayoutTheme.DARK, isDark);
		localStorage.setItem('color-theme', isDark ? LayoutTheme.DARK : LayoutTheme.LIGHT);
	}

	function toggleLocale(): void {
		const newLocale = getLocale($locale) === Locale.DE ? Locale.EN : Locale.DE;
		locale.set(newLocale);
		localStorage.setItem('locale', newLocale);
	}

	let { children } = $props();
</script>

<svelte:head>
	<title>Resa und Till</title>
</svelte:head>

<header class="fixed z-10 w-full">
	<Navbar {isDark} on:locale={toggleLocale} on:theme={toggleTheme} />
</header>

<main
	class="no-scrollbar relative h-screen overflow-scroll bg-gradient-to-b from-gray-200 to-20% pt-20 dark:from-gray-800"
>
	{@render children?.()}
</main>
