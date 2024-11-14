<script>
	import { getContext } from 'svelte';

	import { themeContextKey } from '../../context';

	export let key = null;

	const store = getContext(themeContextKey);

	$: !key ? '' : Object.entries($store[key]).map(([k, v]) => `--${k}: ${v}`);
</script>
