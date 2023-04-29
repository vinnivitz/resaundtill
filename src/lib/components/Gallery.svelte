<script lang="ts">
	import { env } from '$env/dynamic/public';
	import type { DirectusImage } from '$lib/sdk/types';
	import Masonry from 'svelte-bricks';
	import { imageUrlBuilder } from '$lib/utils/image-url-builderutils';
	import { GalleryImage, GalleryThumbnail, Lightbox, LightboxGallery } from 'svelte-lightbox';
	import type { GalleryImageItem } from '$lib/models/gallery-image-item.model';

	export let files: DirectusImage[];

	const images: GalleryImageItem[] = files.map((file, id) => ({
		id,
		src: imageUrlBuilder(file.id),
		title: file.title,
		description: file.description
	}));

	let activeImage: GalleryImageItem;
	let modalOpen = false;
	let programmaticController: {
		toggle: () => void;
		open: () => void;
		close: () => void;
	};

	const [minColWidth, maxColWidth, gap] = [200, 800, 20];

	const openModal = (idx: number): void => {
		activeImage = images[idx];
		modalOpen = true;
	};

	// let images: GalleryItem[] = files.map((file) => ({
	// 	src: `${env.PUBLIC_DIRECTUS_API_URL}/assets/${file.id}`,
	// 	width: file.width,
	// 	height: file.height,
	// 	alt: file.title,
	// 	cropped: true,
	// 	thumbnail: {
	// 		src: `${env.PUBLIC_DIRECTUS_API_URL}/assets/${file.id}`,
	// 		width: file.width > file.height ? imgRatio * (file.width / file.height) : imgRatio,
	// 		height: file.width > file.height ? imgRatio : imgRatio * (file.width / file.height)
	// 	}
	// }));
</script>

{#if modalOpen}
	<LightboxGallery>
		<!-- Layout-->
		<svelte:fragment slot="thumbnail">
			<div class="sample-class-1">
				<GalleryThumbnail id={1}>
					<img src={activeImage.src} alt={activeImage.title} />
				</GalleryThumbnail>
				<div class="sample-class-2">
					<div class="sample-class-3">
						<img src={activeImage.src} alt="Simple lightbox" />
					</div>
					<div class="sample-class-4">
						<img src={activeImage.src} alt="Simple lightbox" />
					</div>
				</div>
			</div>
		</svelte:fragment>

		<GalleryImage>
			<img src="/images/logo.png" alt="Simple lightbox" />
		</GalleryImage>
		<GalleryImage>
			<img src="/images/logo.png" alt="Simple lightbox" />
		</GalleryImage>
		<GalleryImage>
			<img src="/images/logo.png" alt="Simple lightbox" />
		</GalleryImage>
	</LightboxGallery>
{:else}
	<Masonry items={images} minColWidth={200} maxColWidth={800} gap={20} let:item let:idx>
		<Lightbox bind:programmaticController={programmaticController} description={item.description} title={item.title}>
			<img src={item.src} alt={item.title} />
		</Lightbox>
	</Masonry>
{/if}

<!-- Programmatically controlled lightbox without thumbnail -->
