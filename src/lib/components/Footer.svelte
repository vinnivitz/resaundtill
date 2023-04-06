<script lang="ts">
	import { Footer, FooterCopyright, FooterLinkGroup, FooterBrand, FooterLink } from 'flowbite-svelte';
</script>

<Footer footerType="custom" customClass="leading-10 m-1">
	<FooterCopyright href="/" by="Vinzenz Fuhrmann." year={new Date().getFullYear()} />
</Footer>
