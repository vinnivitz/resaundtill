<script lang="ts">
	import Gallery from '$lib/components/Gallery.svelte';
	import { imagesStore } from '$lib/stores';
</script>

<section class="px-5 pb-5 pt-5 md:pb-16 md:pt-8">
	<Gallery images={$imagesStore} showPostLinkOnDetail showDateOnDetail searchable caching={false} />
</section>
