<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import { browser } from '$app/environment';
	import '$lib/locale';
	import { locale, waitLocale } from 'svelte-i18n';
	import type { LayoutData } from './$types';
	import '../app.postcss';
	import Footer from '$lib/components/Footer.svelte';

	export const load: LayoutData = async () => {
		if (browser) {
			locale.set(window.navigator.language);
		}
		await waitLocale();
	};
</script>

<header class="fixed z-50 top-0 left-0 right-0">
	<Navbar />
</header>

<main class="relative z-0">
	<slot />
</main>

<footer class="fixed z-50 bottom-0 left-0 right-0">
	<Footer />
</footer>

<style lang="postcss">
	main {
		margin-top: 4rem;
		background: rgb(2, 0, 36);
		background: linear-gradient(rgba(0, 0, 0, 0.1), #fff);
	}
</style>
