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

<Navbar class="py-1 md:py-3">
	<NavBrand href="/">
		<div class="flex items-center gap-2 md:gap-3">
			<img src="/images/favicon.png" class="h-8 dark:invert md:h-9" alt="Logo" />
			<div class="flex whitespace-nowrap text-xl font-semibold dark:text-white">
				Resa
				<div class="text-red-600">&#10084;</div>
				Till
			</div>
		</div>
	</NavBrand>

	<div use:clickOutside oncanplay={() => (hidden = true)}>
		<div class="flex items-center justify-center">
			<div class="flex items-center justify-center gap-3">
				<div
					role="button"
					onclick={toggleTheme}
					tabindex="0"
					onkeydown={(event) => event.key === 'Enter' && toggleTheme()}
					class="block md:hidden"
					aria-label="Toggle Theme"
				>
					<ThemeSwitcher {isDark} />
				</div>
				<div
					role="button"
					onclick={toggleLocale}
					tabindex="0"
					onkeydown={(event) => event.key === 'Enter' && toggleLocale()}
					class="block md:hidden"
					aria-label="Toggle Locale"
				>
					<LocaleSwitcher />
				</div>
			</div>
			<NavHamburger menuClass="outline-none h-10 w-10" onclick={() => (hidden = !hidden)} />
		</div>
	</div>

	<NavUl
		{hidden}
		activeUrl={$page.url.pathname}
		slideParams={{ delay: 0, duration: 250 }}
		activeClass="md:text-black dark:text-white md:bg-white md:font-medium bg-gray-200 dark:bg-gray-700 dark:md:bg-gray-800"
		ulClass="flex flex-col md:flex-row md:py-3 md:flex-row md:space-x-8 text-center md:text-sm md:font-medium"
	>
		<NavLi href={PagePath.home}>
			<div class="font-semibold hover:text-black dark:hover:text-white md:text-base md:font-normal">
				{$t('nav.map')}
			</div>
		</NavLi>
		<NavLi href={PagePath.travel}>
			<span class="font-semibold hover:text-black dark:hover:text-white md:text-base md:font-normal"
				>{$t('nav.travel')}</span
			>
		</NavLi>
		<NavLi href={PagePath.countries}>
			<span class="font-semibold hover:text-black dark:hover:text-white md:text-base md:font-normal"
				>{$t('nav.countries')}</span
			>
		</NavLi>
		<NavLi href={PagePath.gallery}>
			<span class="font-semibold hover:text-black dark:hover:text-white md:text-base md:font-normal"
				>{$t('nav.gallery')}</span
			>
		</NavLi>
		<NavLi href={PagePath.support}>
			<span class="font-semibold hover:text-black dark:hover:text-white md:text-base md:font-normal"
				>{$t('nav.about')}</span
			>
		</NavLi>
		<NavLi href={PagePath.legals}>
			<span class="font-semibold hover:text-black dark:hover:text-white md:text-base md:font-normal"
				>{$t('nav.legals')}</span
			>
		</NavLi>
		<NavLi class="hidden md:block">
			<div class="flex items-center justify-center gap-4">
				<button onclick={toggleTheme}>
					<ThemeSwitcher {isDark} />
				</button>
				<button onclick={toggleLocale}>
					<LocaleSwitcher />
				</button>
			</div>
		</NavLi>
	</NavUl>
</Navbar>
