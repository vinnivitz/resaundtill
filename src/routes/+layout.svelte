<script lang="ts">
	import '$lib/locale';
	import '../app.pcss';
	import 'flag-icons/css/flag-icons.min.css';

	import { Toast } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { locale } from 'svelte-i18n';
	import { Icon } from 'svelte-icons-pack';
	import { BiSolidErrorAlt } from 'svelte-icons-pack/bi';

	import Navbar from '$lib/components/Navbar.svelte';
	import { LayoutTheme, Locale } from '$lib/models';
	import { alertStore } from '$lib/stores/alert.store';
	import { getLocale } from '$lib/utils';

	let isDark = $state(false);

	onMount(() => {
		isDark =
			localStorage.getItem('color-theme') === LayoutTheme.DARK ||
			(!localStorage.getItem('color-theme') && globalThis.matchMedia('(prefers-color-scheme: dark)').matches);

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
	<Navbar {isDark} {toggleLocale} {toggleTheme} />
</header>

<main
	class="no-scrollbar relative h-screen overflow-scroll bg-gradient-to-b from-gray-200 to-20% pt-[64px] dark:from-gray-800 md:pt-[72px]"
>
	<div id="scroll-anchor"></div>
	{@render children?.()}
</main>

{#if $alertStore}
	<div class="absolute bottom-5 left-0 right-0 flex w-full items-center justify-center">
		<Toast color="red">
			<div class="flex items-center gap-4">
				<Icon src={BiSolidErrorAlt} size="32" color="red"></Icon>
				<div>{$alertStore}</div>
			</div>
		</Toast>
	</div>
{/if}
