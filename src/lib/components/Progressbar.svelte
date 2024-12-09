<script lang="ts">
	let { value }: { value: number } = $props();
</script>

<div class="relative mx-16 h-4 w-full rounded-full bg-gray-700 md:mx-48">
	<div class="absolute left-0 top-0 h-full rounded-full bg-green-500" style={`width: ${value}%`}></div>
	<div class="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center">
		<div class="text-white">{value}%</div>
	</div>
</div>
