<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import '../app.postcss';
</script>

<header class="fixed z-50 top-0 left-0 right-0">
	<Navbar	 />
</header>

<main class="relative z-0" style="margin-top: 4rem">
	<slot />
</main>

<footer></footer>