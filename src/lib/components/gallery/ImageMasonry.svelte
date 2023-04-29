<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import createLayout from './justified-layout';
	import elementResizeEvent, { unbind } from 'element-resize-event';
	import LazyImage from './LazyImage.svelte';
	import { debounce } from './utils';

	// @ts-ignore
	function makeStyle({ scaledWidth, scaledHeight, isLastInRow, isLastRow }) {
		let mr = padding + 'px';
		const mb = isLastRow ? '0' : mr;
		let flex = `0 0 ${scaledWidth}px`;
		if (isLastInRow) {
			mr = '0';
			flex = `1 1 ${scaledWidth - 4}px`;
		}
		return `height:${scaledHeight}px; flex: ${flex}; margin-right:${mr}; margin-bottom: ${mb}`;
	}

	/**
	 * @param {string | number} index
	 */
	function onClick(index) {
		dispatch('image-click', {
			// @ts-ignore
			image: images[index],
			index
		});
	}

	const dispatch = createEventDispatcher();

	// props
	/**
	 * @type {never[]}
	 */
	export let images = [];
	export let targetRowHeight = 220;
	export let padding = 4;

	// state
	/**
	 * @type {Element}
	 */
	let element;
	/**
	 * @type {ArrayLike<any>}
	 */
	let scaledImages = [];
	/**
	 * @type {number}
	 */
	let width;
	let isResizing = false;

	// reactive statement
	$: if (width) {
		scaledImages = createLayout({
			images,
			containerWidth: width,
			targetHeight: targetRowHeight,
			padding
		});
	}

	onMount(() => {
		width = element.getBoundingClientRect().width;

		const resizedFinished = debounce(() => {
			isResizing = false;
		}, 100);

		elementResizeEvent(element, () => {
			if (Math.round(width) !== Math.round(element.getBoundingClientRect().width)) {
				isResizing = true;
				width = element.getBoundingClientRect().width;
				resizedFinished();
			}
		});

		return () => unbind(element);
	});
</script>

<div class="image-masonry {isResizing ? 'is-resizing' : ''}">
	<div data-resizer bind:this={element} />
	<div class="image-masonry-container" style="width: {width}px">
		{#each scaledImages as image (image.src)}
			<div class="masonry-item" style={makeStyle(image)} on:click={() => onClick(image.index)}>
				<LazyImage {...image} />
				<slot {image} />
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.image-masonry {
		max-width: 100%;
		&.is-resizing {
			overflow: hidden;
		}
	}

	.image-masonry-container {
		display: -ms-flexbox;
		display: flex;
		-ms-flex-wrap: wrap;
		flex-wrap: wrap;
	}

	.masonry-item {
		position: relative;
		background: rgba(255, 255, 255, 0.1);
	}
</style>
