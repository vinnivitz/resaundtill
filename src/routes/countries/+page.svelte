<script lang="ts">
	import { DirectusImageTransformation, PagePath, type CountryEntryTranslation } from '$lib/models';

	import { fly } from 'svelte/transition';
	import type { PageData } from '../$types';
	import { onMount } from 'svelte';
	import { locale, t } from 'svelte-i18n';
	import { getTranslation, imageUrlBuilder } from '$lib/utils';

	export let data: PageData;

	$: countries = data.countries.map((country) => {
		const { id, code, thumbnail, translations } = country;
		const imageUrl = thumbnail
			? imageUrlBuilder(thumbnail, DirectusImageTransformation.PREVIEW)
			: '/images/gallery/travel.jpg';
		return { id, code, imageUrl, thumbnail, translations };
	});

	const observers: HTMLDivElement[] = [];
	let observer: IntersectionObserver;

	function getCountryTranslation(
		translations: CountryEntryTranslation[],
		locale: string | null | undefined
	): CountryEntryTranslation | undefined {
		return getTranslation<CountryEntryTranslation>(translations, locale);
	}

	function lazyLoadBackground(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const element = entry.target as HTMLDivElement;
				if (element) {
					element.style.backgroundImage = `url(${element.dataset.bgUrl})`;
					observer.unobserve(element);
				}
			}
		});
	}

	function registerObserver(node: HTMLDivElement) {
		observers.push(node);
		observer?.observe(node);
		return {
			destroy() {
				observer.unobserve(node);
			}
		};
	}

	onMount(() => {
		observer = new IntersectionObserver(lazyLoadBackground, {
			root: null,
			rootMargin: '0px',
			threshold: 0.01
		});

		observers.forEach((obs) => observer.observe(obs));
	});
</script>

<section in:fly={{ y: 50, duration: 1000 }} class="mx-auto max-w-screen-xl p-5 dark:text-gray-100">
	<div class="mx-auto max-w-screen-xl p-5 dark:text-gray-100">
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{#each countries as country}
				<a
					href={`${PagePath.countries}/${country.id}`}
					class="xl:transition xl:delay-150 xl:duration-300 xl:ease-in-out xl:hover:-translate-y-1 xl:hover:scale-110"
				>
					<div
						class="relative flex h-96 w-full items-end justify-start bg-cover bg-center text-left dark:bg-gray-500"
						data-bg-url={country.imageUrl}
						use:registerObserver
						style={`background-color: #6c7380;`}
					>
						<div
							class="absolute bottom-0 left-0 right-0 top-0 z-[-1] bg-gradient-to-b dark:from-gray-900 dark:via-transparent dark:to-gray-900"
						/>
						<div
							class="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black to-transparent px-5 pb-40 pt-3"
						>
							<div class="flex items-center justify-start gap-2 text-center text-gray-700">
								<span class="text-3xl font-semibold leading-none tracking-wide">
									<span class={`fi fi-${country.code.toLowerCase()}`}></span>
								</span>
								<span class="text-gray-300 opacity-90 text-center uppercase leading-none">
									{getCountryTranslation(country.translations, $locale)?.name}
								</span>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</section>

