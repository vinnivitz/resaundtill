<script lang="ts">
	import type { BlogPostEntry } from '$lib/sdk/types';
	import BlogPost from './BlogPost.svelte';

	export let posts: BlogPostEntry[];
</script>

<div class="max-w-screen-xl p-5 mx-auto dark:bg-gray-800 dark:text-gray-100">
	<div class="grid grid-cols-1 gap-5 lg:grid-cols-4 sm:grid-cols-2">
		{#each posts as post}
			<a
				href={`/travel/${post.id}`}
				class="xl:transition xl:ease-in-out xl:delay-150 xl:hover:-translate-y-1 xl:hover:scale-110 xl:duration-300"
			>
				<BlogPost {post} />
			</a>
		{/each}
	</div>
</div>
