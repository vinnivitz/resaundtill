/**
 * @param {number} n
 */
export function round(n) {
	return Math.round(n * 100 + Number.EPSILON) / 100;
}

/**
 * @param {number} width
 * @param {number} height
 */
export function ratio(width, height) {
	return round(width / height);
}

/**
 * @param {number} width
 * @param {number} ratio
 */
export function scaleHeight(width, ratio) {
	return round(width / ratio);
}

/**
 * @param {number} height
 * @param {number} ratio
 */
export function scaleWidth(height, ratio) {
	return round(height * ratio);
}

/**
 * @param {{ apply: (arg0: any, arg1: IArguments) => void; }} fn
 * @param {number | undefined} delay
 */
export function debounce(fn, delay) {
	/**
   * @type {string | number | NodeJS.Timeout | null | undefined}
   */
	let timeoutID = null;
	return function () {
		// @ts-ignore
		clearTimeout(timeoutID);
		const args = arguments;
		// @ts-ignore
		const that = this;
		timeoutID = setTimeout(function () {
			fn.apply(that, args);
		}, delay);
	};
}
