<script lang="ts">
	import { env } from '$env/dynamic/public';
	import Gallery from '$lib/components/Gallery.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Gallery urls={data.files.map((file) => `${env.PUBLIC_DIRECTUS_API_URL}/assets/${file.id}`)} />
