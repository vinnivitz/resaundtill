import { Locale } from '$lib/models';

import { browser } from '$app/environment';

import { getLocale } from './locale.util';

export function clickOutside(node: Node): { destroy: () => void } {
	function handleClick(event: Event): void {
		if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('canplay', node as object));
		}
	}
	document.addEventListener('click', handleClick, true);
	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}

export function debounce<T extends (...arguments_: unknown[]) => void>(
	function_: T,
	delay: number
): (...arguments_: Parameters<T>) => Promise<void> {
	let timeoutId: NodeJS.Timeout | undefined;
	return (...arguments_: Parameters<T>) =>
		new Promise<void>((resolve) => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			timeoutId = setTimeout(() => {
				function_(...arguments_);
				resolve();
			}, delay);
		});
}

export function isDefined<T>(value: T | undefined): value is T {
	return value !== undefined;
}

export function scrollTop(smooth = true): void {
	if (browser) {
		document.querySelector('#scroll-anchor')?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'end' });
	}
}

export function formatNumber(number_: number, locale: string | null | undefined): string {
	const separators =
		getLocale(locale) === Locale.DE ? { thousand: '.', decimal: ',' } : { thousand: ',', decimal: '.' };
	const isNegative = number_ < 0;
	const [integer, decimal] = Math.abs(number_).toFixed(2).split('.');
	// eslint-disable-next-line security/detect-unsafe-regex, sonarjs/slow-regex
	const formattedInt = integer.replaceAll(/\B(?=(\d{3})+(?!\d))/g, separators.thousand);
	const formattedDec = decimal === '00' ? '' : separators.decimal + decimal;
	return (isNegative ? '-' : '') + formattedInt + formattedDec;
}
