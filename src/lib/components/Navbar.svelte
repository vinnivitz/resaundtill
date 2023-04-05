<script lang="ts">
	import clickOutside from '$lib/utils/clickOutside';
	import { page } from '$app/stores';

	let navbar: HTMLDivElement;

	let currentRoute = '/';

	page.subscribe((path) => (currentRoute = path.url.pathname));
</script>

<nav class="border-gray-200 bg-gray-100 dark:bg-gray-800 dark:border-gray-700">
	<div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
		<div>
			<a href="/" class="flex items-center">
				<img src="images/logo2.png" class="h-8 mr-3 grayscale" alt="Flowbite Logo" />
				<span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"
					>Resa<span class="text-red-600">&#10084;</span>Till</span
				>
			</a>
		</div>
		<button
			on:click={() => navbar.classList.toggle('hidden')}
			use:clickOutside
			on:canplay={() => navbar.classList.add('hidden')}
			data-collapse-toggle="navbar-solid-bg"
			type="button"
			class="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
			aria-controls="navbar-solid-bg"
			aria-expanded="false"
		>
			<!-- <span class="sr-only">Open main menu</span> -->
			<svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
				><path
					fill-rule="evenodd"
					d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
					clip-rule="evenodd"
				/></svg
			>
		</button>
		<div
			bind:this={navbar}
			class:absolute={navbar && !navbar?.classList.contains('hidden')}
			class="z-50 top-14 left-0 hidden w-full md:block md:w-auto"
			id="navbar-solid-bg"
		>
			<ul
				class="flex flex-col font-medium mt-4 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-transparent dark:border-gray-700"
			>
				<li>
					<a
						href="/"
						class:bg-blue-700={currentRoute === '/' && navbar && navbar?.classList.contains('hidden')}
						class:text-white={currentRoute === '/' && navbar && navbar?.classList.contains('hidden')}
						class:md:text-blue-700={currentRoute === '/' && navbar && navbar?.classList.contains('hidden')}
						class:md:dark:text-blue-500={currentRoute === '/' && navbar && navbar?.classList.contains('hidden')}
						class:dark:bg-blue-600={currentRoute === '/' && navbar && navbar?.classList.contains('hidden')}
						class="block py-2 pl-3 pr-4 rounded md:bg-transparent md:p-0 md:hover:text-blue-700 md:dark:bg-transparent"
						aria-current="page">Karte</a
					>
				</li>
				<li>
					<a
						href="/travel"
						class:bg-blue-700={currentRoute === '/travel' && navbar && navbar?.classList.contains('hidden')}
						class:text-white={currentRoute === '/travel' && navbar && navbar?.classList.contains('hidden')}
						class:md:text-blue-700={currentRoute === '/travel' && navbar && navbar?.classList.contains('hidden')}
						class:md:dark:text-blue-500={currentRoute === '/traval' && navbar && navbar?.classList.contains('hidden')}
						class:dark:bg-blue-600={currentRoute === '/travel' && navbar && navbar?.classList.contains('hidden')}
						class="block py-2 pl-3 pr-4 rounded md:bg-transparent md:p-0 md:hover:text-blue-700 md:dark:bg-transparent"
						aria-current="page">Unsere Reise</a
					>
				</li>
				<li>
					<a
						href="/gallery"
						class:bg-blue-700={currentRoute === '/gallery' && navbar && navbar?.classList.contains('hidden')}
						class:text-white={currentRoute === '/gallery' && navbar && navbar?.classList.contains('hidden')}
						class:md:text-blue-700={currentRoute === '/gallery' && navbar && navbar?.classList.contains('hidden')}
						class:md:dark:text-blue-500={currentRoute === '/gallery' && navbar && navbar?.classList.contains('hidden')}
						class:dark:bg-blue-600={currentRoute === '/gallery' && navbar && navbar?.classList.contains('hidden')}
						class="block py-2 pl-3 pr-4 rounded md:bg-transparent md:p-0 md:hover:text-blue-700 md:dark:bg-transparent"
						>Bildergalerie</a
					>
				</li>
				<li>
					<a
						href="/support-us"
						class:bg-blue-700={currentRoute === '/support-us' && navbar && navbar?.classList.contains('hidden')}
						class:text-white={currentRoute === '/support-us' && navbar && navbar?.classList.contains('hidden')}
						class:md:text-blue-700={currentRoute === '/support-us' && navbar && navbar?.classList.contains('hidden')}
						class:md:dark:text-blue-500={currentRoute === '/support-us' && navbar && navbar?.classList.contains('hidden')}
						class:dark:bg-blue-600={currentRoute === '/support-us' && navbar && navbar?.classList.contains('hidden')}
						class="block py-2 pl-3 pr-4 rounded md:bg-transparent md:p-0 md:hover:text-blue-700 md:dark:bg-transparent"
						>Unterstützt uns!</a
					>
				</li>
				<li>
					<a
						href="/legals"
						class:bg-blue-700={currentRoute === '/legals' && navbar && navbar?.classList.contains('hidden')}
						class:text-white={currentRoute === '/legals' && navbar && navbar?.classList.contains('hidden')}
						class:md:text-blue-700={currentRoute === '/legals' && navbar && navbar?.classList.contains('hidden')}
						class:md:dark:text-blue-500={currentRoute === '/legals' && navbar && navbar?.classList.contains('hidden')}
						class:dark:bg-blue-600={currentRoute === '/legals' && navbar && navbar?.classList.contains('hidden')}
						class="block py-2 pl-3 pr-4 rounded md:bg-transparent md:p-0 md:hover:text-blue-700 md:dark:bg-transparent"	
						>Impressum</a
					>
				</li>
			</ul>
		</div>
	</div>
</nav>
