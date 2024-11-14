<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition';

	let { animate = false, children }: { animate?: boolean; children: Snippet } = $props();
</script>

<section in:fly={{ y: animate ? 50 : 0, duration: animate ? 1000 : 0 }} class="pt-4 md:pt-12">
	{@render children?.()}
</section>
