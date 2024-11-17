export function debounce<T extends (...arguments_: unknown[]) => void>(
	function_: T,
	delay: number
): (...arguments_: Parameters<T>) => Promise<void> {
	let timeoutId: NodeJS.Timeout | undefined = undefined;

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
