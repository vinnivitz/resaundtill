<script lang="ts">
	import { PagePath } from '$lib/models/router.model';
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import { _ } from 'svelte-i18n';
	import clickOutside from '$lib/utils/clickOutside';
	import { page } from '$app/stores';
	import BiSolidMoon from 'svelte-icons-pack/bi/BiSolidMoon';
	import BiSolidSun from 'svelte-icons-pack/bi/BiSolidSun';
	import { userStore } from '$lib/stores/user.store';
	import { LayoutTheme } from '$lib/models/user.model';
	import Icon from 'svelte-icons-pack';
	import { DarkMode } from 'flowbite-svelte';

	let theme = LayoutTheme.light;
	let hidden = true;
	let themeIconActive = false;

	userStore.subscribe((store) => (theme = store.theme));
</script>

<Navbar>
	<NavBrand href="/">
		<img src="/images/logo2.png" class="mr-3 h-6 sm:h-9 grayscale dark:grayscale-0" alt="Logo" />
		<span class=" whitespace-nowrap text-2xl font-semibold dark:text-white">
			Resa<span class="text-red-600">&#10084;</span>Till
		</span>
	</NavBrand>

	<div use:clickOutside on:canplay={() => (hidden = true)}>
		<NavHamburger on:click={() => (hidden = !hidden)} />
	</div>

	<NavUl {hidden}>
		<!-- <NavLi href={PagePath.home} active={$page.url.pathname === PagePath.home}>
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
		</NavLi> -->
		<NavLi>
			<DarkMode
				btnClass={'rounded-lg text-xl p-1 transform scale-150'}
			/>
		</NavLi>
	</NavUl>
</Navbar>
