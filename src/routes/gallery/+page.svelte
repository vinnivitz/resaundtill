<script lang="ts">
	import Gallery from '$lib/components/Gallery.svelte';
	import { imagesStore } from '$lib/stores';

	const images = $derived(
		$imagesStore &&
			new Date($imagesStore[0].date).getTime() > new Date($imagesStore[$imagesStore.length - 1].date).getTime()
			? $imagesStore.reverse()
			: $imagesStore
	);
</script>

<section class="px-5 pb-5 pt-5 md:pb-16 md:pt-8">
	<Gallery {images} showPostLinkOnDetail caching={false} searchable />
</section>
