export function debounce<T extends (...args: unknown[]) => R, R>(
	func: T,
	delay: number
): (...args: Parameters<T>) => Promise<R> {
	let timeoutId: NodeJS.Timeout;
	return (...args: Parameters<T>) =>
		new Promise<R>((resolve) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => resolve(func(...args) as R), delay); // Cast to `R`
		});
}
