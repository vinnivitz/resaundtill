<script lang="ts">
	import { env } from '$env/dynamic/public';
	import Gallery from '$lib/components/Gallery.svelte';
	import { fly } from 'svelte/transition';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<section in:fly={{ y: 50, duration: 1000 }}>
	<Gallery files={data.files} />
</section>
