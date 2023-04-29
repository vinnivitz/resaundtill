<script lang="ts">
	import { onMount } from 'svelte';
	import ImageMasonry from './ImageMasonry.svelte';
	import sampleImages from './images-advanced';
	import openPhotoSwipe from './photoswipe/index';

	let element: any;
	let images: any[] = sampleImages || [];
	let targetRowHeight = 220;
	let onChangeImages: any;
	let onChangeRowHeight: any;
	let onClick: any;

	onMount(async () => {
		function shuffleArray(array: any[]) {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[array[i], array[j]] = [array[j], array[i]];
			}
		}

		function onClick(event: any) {
			// create array compatible with PhotoSwipe
			const imgs = images.map(({ src, width, height, original, title }) => {
				return {
					src: original,
					msrc: src,
					w: width,
					h: height,
					title
				};
			});
			openPhotoSwipe(imgs, event.detail.index, (index) => {
				return element.querySelectorAll('[data-masonry-image]')[index];
			});
		}

		function onChangeImages() {
			const newArray = [...sampleImages];
			shuffleArray(newArray);
			images = newArray;
		}

		function onChangeRowHeight() {
			targetRowHeight = targetRowHeight + 50;
		}
	});
</script>

<div class="pb-3 text-right">
	<button class="btn btn-light btn-sm" type="button" on:click={onChangeImages}>Shuffle images</button>
	<button class="btn btn-light btn-sm" type="button" on:click={onChangeRowHeight}>Increase row height</button>
</div>
<div bind:this={element}>
	<ImageMasonry {images} {targetRowHeight} on:image-click={onClick} let:image>
		<div class="image-overlay">
			<div class="image-text">{image.title}</div>
		</div>
	</ImageMasonry>
</div>

<style lang="scss">
	.image-overlay {
		cursor: pointer;
		display: flex;
		display: -ms-flexbox;
		align-items: flex-end;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		opacity: 0;
		transition: opacity 250ms linear;
		z-index: 1;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.5) 0%,
			rgba(0, 0, 0, 0) 25%,
			rgba(0, 0, 0, 0) 75%,
			rgba(0, 0, 0, 0.5) 100%
		);

		&.select-mode,
		&:hover {
			opacity: 1;
		}

		&.select-mode:hover {
			.image-magnify {
				display: block;
			}
		}

		+ [data-masonry-image] img {
			transition: transform 100ms linear;
		}

		&.is-selected {
			opacity: 1;

			.image-text {
				display: none;
			}

			+ [data-masonry-image] {
				background-color: #111;
				img {
					//transform: scale(0.9);
					transform: translateZ(0px) scale3d(0.9, 0.9, 1);
				}
			}
		}
	}

	.image-text {
		color: #fff;
		text-shadow: 0 0 2px #000;
		padding: 5px 8px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
