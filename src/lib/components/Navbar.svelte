<script lang="ts">
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import { t } from 'svelte-i18n';

	import { PagePath } from '$lib/models';
	import { clickOutside } from '$lib/utils';

	import { page } from '$app/stores';

	import LocaleSwitcher from './LocaleSwitcher.svelte';
	import ThemeSwitcher from './ThemeSwitcher.svelte';

	let { isDark, toggleTheme, toggleLocale }: { isDark: boolean; toggleTheme: () => void; toggleLocale: () => void } =
		$props();

	let hidden = $state(true);
</script>

<Navbar>
	<NavBrand href="/">
		<img src="/images/favicon.png" class="mr-3 h-6 dark:invert sm:h-9" alt="Logo" />
		<span class=" whitespace-nowrap text-2xl font-semibold dark:text-white">
			Resa<span class="text-red-600">&#10084;</span>Till
		</span>
	</NavBrand>

	<div use:clickOutside oncanplay={() => (hidden = true)}>
		<div class="flex items-center justify-center gap-4">
			<button onclick={toggleTheme}>
				<ThemeSwitcher {isDark} />
			</button>
			<button onclick={toggleLocale} class="block md:hidden">
				<LocaleSwitcher />
			</button>
			<button class="m-0 p-0">
				<NavHamburger menuClass="outline-none h-10 w-10" class="" onClick={() => (hidden = !hidden)} />
			</button>
		</div>
	</div>

	<NavUl
		{hidden}
		activeUrl={$page.url.pathname}
		activeClass="text-black dark:text-white"
		ulClass="flex flex-col text-center py-4 px-2 lg:p-4 mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium"
	>
		<NavLi href={PagePath.home}>
			<div class="text-lg md:text-base lg:text-xl">{$t('nav.map')}</div>
		</NavLi>
		<NavLi href={PagePath.travel}>
			<span class="text-lg md:text-base lg:text-xl">{$t('nav.travel')}</span>
		</NavLi>
		<NavLi href={PagePath.countries}>
			<span class="text-lg md:text-base lg:text-xl">{$t('nav.countries')}</span>
		</NavLi>
		<NavLi href={PagePath.gallery}>
			<span class="text-lg md:text-base lg:text-xl">{$t('nav.gallery')}</span>
		</NavLi>
		<NavLi href={PagePath.support}>
			<span class="text-lg md:text-base lg:text-xl">{$t('nav.about')}</span>
		</NavLi>
		<NavLi href={PagePath.legals}>
			<span class="text-lg md:text-base lg:text-xl">{$t('nav.legals')}</span>
		</NavLi>
		<NavLi class="hidden md:block" onclick={toggleTheme}>
			<ThemeSwitcher {isDark} />
		</NavLi>
		<NavLi onclick={toggleLocale} class="hidden md:block">
			<LocaleSwitcher />
		</NavLi>
	</NavUl>
</Navbar>
