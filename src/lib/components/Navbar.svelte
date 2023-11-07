<svelte:options accessors={true} />

<script lang="ts">
	import { PagePath } from '$lib/models/router.model';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/stores';
	import { DarkMode } from 'flowbite-svelte';
	// @ts-ignore
	import FaFlag from 'svelte-icons/fa/FaFlag.svelte';
	import { createEventDispatcher } from 'svelte';
	import { clickOutside } from '$lib/utils';

	const dispatch = createEventDispatcher();

	const toggleLocale = () => dispatch('locale');

	let hidden = true;
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

	<NavUl {hidden}>
		<NavLi href={PagePath.home} active={$page.url.pathname === PagePath.home}>
			<span class="text-md md:text-xl">{$_('nav.map')}</span>
		</NavLi>
		<NavLi href={PagePath.travel} active={$page.url.pathname === PagePath.travel}>
			<span class="text-md md:text-xl">{$_('nav.travel')}</span>
		</NavLi>
		<NavLi href={PagePath.gallery} active={$page.url.pathname === PagePath.gallery}>
			<span class="text-md md:text-xl">{$_('nav.gallery')}</span>
		</NavLi>
		<NavLi href={PagePath.support} active={$page.url.pathname === PagePath.support}>
			<span class="text-md md:text-xl">{$_('nav.support-us')}</span>
		</NavLi>
		<NavLi href={PagePath.legals} active={$page.url.pathname === PagePath.legals}>
			<span class="text-md md:text-xl">{$_('nav.legals')}</span>
		</NavLi>
		<NavLi>
			<DarkMode btnClass={'rounded-lg text-xl p-1 transform scale-150'} />
		</NavLi>
		<NavLi on:click={toggleLocale}>
			<div class="mt-1 w-6 h-6 cursor-pointer">
				<FaFlag />
			</div>
		</NavLi>
	</NavUl>
</Navbar>
