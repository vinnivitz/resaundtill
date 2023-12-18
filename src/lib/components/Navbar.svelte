<svelte:options accessors={true} />

<script lang="ts">
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import { clickOutside } from '$lib/utils';
	import ThemeSwitcher from './ThemeSwitcher.svelte';
	import LocaleSwitcher from './LocaleSwitcher.svelte';
	import { PagePath } from '$lib/models';

	export let isDark: boolean;

	const dispatch = createEventDispatcher();
	let hidden = true;

	const toggleLocale = () => dispatch('locale');
	const toggleTheme = () => dispatch('theme');

	$: activePath = $page.url.pathname;
	$: isActive = (path: string) => activePath === path;
</script>

<Navbar navClass="p-2 md:p-0">
	<NavBrand href="/">
		<img src="/images/kranich.png" class="mr-3 h-6 sm:h-9 dark:invert" alt="Logo" />
		<span class=" whitespace-nowrap text-2xl font-semibold dark:text-white">
			Resa<span class="text-red-600">&#10084;</span>Till
		</span>
	</NavBrand>

	<div use:clickOutside on:canplay={() => (hidden = true)}>
		<NavHamburger on:click={() => (hidden = !hidden)} />
	</div>

	<NavUl
		{hidden}
		ulClass="flex flex-col py-4 px-2 lg:p-4 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium"
	>
		<NavLi href={PagePath.home} active={isActive(PagePath.home)}>
			<span class="text-md md:text-xl">{$_('nav.map')}</span>
		</NavLi>
		<NavLi href={PagePath.travel} active={isActive(PagePath.travel)}>
			<span class="text-md md:text-xl">{$_('nav.travel')}</span>
		</NavLi>
		<NavLi href={PagePath.gallery} active={isActive(PagePath.gallery)}>
			<span class="text-md md:text-xl">{$_('nav.gallery')}</span>
		</NavLi>
		<NavLi href={PagePath.support} active={isActive(PagePath.support)}>
			<span class="text-md md:text-xl">{$_('nav.about')}</span>
		</NavLi>
		<NavLi href={PagePath.legals} active={isActive(PagePath.legals)}>
			<span class="text-md md:text-xl">{$_('nav.legals')}</span>
		</NavLi>
		<NavLi on:click={toggleTheme}>
			<div class="mt-2">
				<ThemeSwitcher {isDark} />
			</div>
		</NavLi>
		<NavLi on:click={toggleLocale}>
			<LocaleSwitcher />
		</NavLi>
	</NavUl>
</Navbar>
