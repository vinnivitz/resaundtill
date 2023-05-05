<script lang="ts">
	import Gallery from '$lib/components/Gallery.svelte';
	import { fly } from 'svelte/transition';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<section class="pt-5 pb-5 md:py-16 px-5" in:fly={{ y: 50, duration: 1000 }}>
	<Gallery files={data.files} />
</section>
