export function debounce<T extends (...args: unknown[]) => void>(
	func: T,
	delay: number
): (...args: Parameters<T>) => Promise<void> {
	let timeoutId: NodeJS.Timeout | null = null;

	return (...args: Parameters<T>) =>
		new Promise<void>((resolve) => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			timeoutId = setTimeout(() => {
				func(...args);
				resolve();
			}, delay);
		});
}
