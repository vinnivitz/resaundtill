<script lang="ts">
	import { Page } from '$lib/models/router.model';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Avatar } from 'flowbite-svelte';
	import { _ } from 'svelte-i18n';
	import clickOutside from '$lib/utils/clickOutside';
	import { page } from '$app/stores';
	import Icon from 'svelte-icons-pack/Icon.svelte';
	import IoLanguage from 'svelte-icons-pack/io/IoLanguage';

	let currentRoute: string = Page.home;
	let hidden = true;

	page.subscribe((path) => (currentRoute = path.url.pathname));
</script>

<Navbar>
	<NavBrand href="/">
		<img src="images/logo2.png" class="mr-3 h-6 sm:h-9 grayscale dark:grayscale-0" alt="Logo" />
		<span class="self-center whitespace-nowrap text-2xl font-semibold dark:text-white">
			Resa<span class="text-red-600">&#10084;</span>Till
		</span>
	</NavBrand>

	<div use:clickOutside on:canplay={() => (hidden = true)}>
		<NavHamburger on:click={() => (hidden = !hidden)} />
	</div>

	<NavUl {hidden}>
		<NavLi href={Page.home} active={currentRoute === Page.home}>
			<span class="text-md md:text-xl">{$_('nav.map')}</span>
		</NavLi>
		<NavLi href={Page.travel} active={currentRoute === Page.travel}>
			<span class="text-xl">{$_('nav.travel')}</span>
		</NavLi>
		<NavLi href={Page.gallery} active={currentRoute === Page.gallery}>
			<span class="text-xl">{$_('nav.gallery')}</span>
		</NavLi>
		<NavLi href={Page.support} active={currentRoute === Page.support}>
			<span class="text-xl">{$_('nav.support-us')}</span>
		</NavLi>
		<NavLi href={Page.legals} active={currentRoute === Page.legals}>
			<span class="text-xl">{$_('nav.legals')}</span>
		</NavLi>
	</NavUl>
</Navbar>
