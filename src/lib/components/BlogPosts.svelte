<script lang="ts">
	import { PagePath } from '$lib/models';
	import type { BlogPostEntry, DirectusImage } from '$lib/sdk/types';
	import { getTranslationIdx, imageUrlBuilder } from '$lib/utils';
	import type { ID } from '@directus/sdk';
	import { locale } from 'svelte-i18n';

	export let posts: BlogPostEntry[];

	const asDirectusID = (image: ID | DirectusImage) => image as ID;
</script>

<div class="max-w-screen-xl p-5 mx-auto dark:text-gray-100">
	<div class="grid grid-cols-1 gap-5 lg:grid-cols-4 sm:grid-cols-2">
		{#each posts as post}
			<a
				href={`${PagePath.travel}/${post.id}`}
				class="xl:transition xl:ease-in-out xl:delay-150 xl:hover:-translate-y-1 xl:hover:scale-110 xl:duration-300"
			>
				<div
					class="relative flex items-end justify-start w-full text-left bg-center bg-cover h-96 dark:bg-gray-500"
					style={`background-image: url(${
						post.images && post.images[0]
							? imageUrlBuilder(post.images && asDirectusID(post.images[0]?.directus_files_id), true)
							: '/images/travel.jpg'
					});`}
				>
					<div
						class="z-[-1] absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-b dark:via-transparent dark:from-gray-900 dark:to-gray-900"
					/>
					<div class="absolute top-0 left-0 right-0 flex items-center justify-between mx-5 mt-3">
						<div class="flex flex-col justify-start text-center text-gray-700">
							<span class="text-3xl font-semibold leading-none tracking-wide text-shadow"
								>{new Date(post.date).getDate()}</span
							>
							<span class="leading-none uppercase text-shadow"
								>{new Date(post.date).toLocaleString('default', { month: 'long' })}</span
							>
						</div>
					</div>
					<div class="w-full bg-gradient-to-t from-black to-transparent">
						<h2 class="p-5">
							<div class="font-medium text-gray-300 text-md">
								{post.translations[getTranslationIdx($locale)].title}
							</div>
						</h2>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>

<style lang="postcss">
	.text-shadow {
		text-shadow: 0 0 5px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 255, 255, 1);
	}
</style>
