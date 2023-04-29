<script lang="ts">
	import { Heading, Secondary, Hr } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import BsCalendarDateFill from 'svelte-icons-pack/bs/BsCalendarDateFill';
	import { CarouselTransition } from 'flowbite-svelte';
	import { env } from '$env/dynamic/public';
	import { fly } from 'svelte/transition';
	import { _ } from 'svelte-i18n';
	import { Carousel } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { Lightbox, LightboxGallery, GalleryThumbnail, GalleryImage } from 'svelte-lightbox';

	let lightboxProgrammaticController: any;

	import Masonry from 'svelte-bricks';
	import Icon from 'svelte-icons-pack';
	import imageToBase64 from 'image-to-base64';

	let nItems = 30;
	$: items = [...Array(nItems).keys()];

	let [minColWidth, maxColWidth, gap] = [200, 800, 20];
	let width: number;
	let height: number;

	export let data: PageData;

	const images =
		data.post.images?.map((image, i) => ({
			id: i,
			name: image.directus_files_id.title,
			imgurl: `${env.PUBLIC_DIRECTUS_API_URL}/assets/${image.directus_files_id.id}`
		})) || [];

	const formatDate = (date: Date) =>
		`${date.toLocaleString('default', { weekday: 'long' })}, ${
			date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
		}.${date.toLocaleString('default', { month: 'long' })}.${date.getFullYear()}`;
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="p-3 md:p-12 mb-24">
	<Heading customSize="text-5xl"><Secondary>{data.post.title}</Secondary></Heading>
	<Hr />
	<div class="flex justify-end gap-4 items-center">
		<div><Icon className="text-lg md:text-2xl" src={BsCalendarDateFill} /></div>
		<div class="text-sm md:text-lg">{formatDate(new Date(data.post.date))}</div>
	</div>
	<p class="pt-8 md:pt-12 text-lg">
		{data.post.description ?? ''}
	</p>

	<Hr />
	<Heading customSize="pt-5 pb-3 text-4xl"><Secondary>{$_('traval.gallery-title')}</Secondary></Heading>

	<div class="m-2">
		<Masonry items={images} {minColWidth} {maxColWidth} {gap} let:item>
			<img src={item.imgurl} alt={item.name} />
		</Masonry>
	</div>
</section>
