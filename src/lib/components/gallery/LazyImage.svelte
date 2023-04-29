<script>
	import { onMount } from 'svelte';
	import { cache } from './cache';
	import whenElementVisible from './when-element-visible';

	function onLoad() {
		// @ts-ignore
		cache[src] = true;
		isLoaded = true;
	}

	// props
	export let src = '';
	export let srcset = '';
	export let alt = '';

	// state
	// @ts-ignore
	let element;
	let isLoaded = false;
	let isVisible = false;

	// @ts-ignore
	if (cache[src]) {
		isLoaded = true;
		isVisible = true;
	}

	onMount(() => {
		if (isLoaded) {
			return;
		}

		// @ts-ignore
		const disconnect = whenElementVisible(element, () => {
			isVisible = true;
		});

		return () => {
			disconnect();
		};
	});
</script>

<div data-masonry-image class="lazy-image-container {isLoaded ? 'is-loaded' : ''}" bind:this={element}>
	{#if isVisible}
		<img class="lazy-image {isLoaded ? 'is-loaded' : ''}" on:load={onLoad} {src} {srcset} {alt} />
	{/if}
</div>

<style lang="scss">
	.lazy-image-container {
		width: 100%;
		height: 100%;
		position: relative;
		display: block;

		transition: opacity 300ms ease-in-out;
		opacity: 0;

		&.is-loaded {
			opacity: 1;
		}

		.is-instant {
			opacity: 1;
			transition: none;
		}
	}

	.lazy-image {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
