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

<Navbar>
	<NavBrand href="/">
		<img src="/images/favicon.png" class="mr-3 h-6 dark:invert sm:h-9" alt="Logo" />
		<span class=" whitespace-nowrap text-2xl font-semibold dark:text-white">
			Resa<span class="text-red-600">&#10084;</span>Till
		</span>
	</NavBrand>

	<div use:clickOutside on:canplay={() => (hidden = true)}>
		<NavHamburger menuClass="outline-none" onClick={() => (hidden = !hidden)} />
	</div>

	<NavUl
		{hidden}
		ulClass="flex flex-col text-center py-4 px-2 lg:p-4 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium"
	>
		<NavLi href={PagePath.home} active={isActive(PagePath.home)}>
			<span class="text-xl">{$_('nav.map')}</span>
		</NavLi>
		<NavLi href={PagePath.travel} active={isActive(PagePath.travel)}>
			<span class="text-xl">{$_('nav.travel')}</span>
		</NavLi>
		<NavLi href={PagePath.gallery} active={isActive(PagePath.gallery)}>
			<span class="text-xl">{$_('nav.gallery')}</span>
		</NavLi>
		<NavLi href={PagePath.support} active={isActive(PagePath.support)}>
			<span class="text-xl">{$_('nav.about')}</span>
		</NavLi>
		<NavLi href={PagePath.legals} active={isActive(PagePath.legals)}>
			<span class="text-xl">{$_('nav.legals')}</span>
		</NavLi>
		<NavLi>
			<div class="mt-3 flex items-center justify-center gap-4 md:mt-[5.5px]">
				<button on:click={toggleTheme}>
					<ThemeSwitcher {isDark} />
				</button>
				<button on:click={toggleLocale} class="block md:hidden">
					<LocaleSwitcher />
				</button>
			</div>
		</NavLi>
		<NavLi on:click={toggleLocale} class="hidden md:block">
			<LocaleSwitcher />
		</NavLi>
	</NavUl>
</Navbar>
