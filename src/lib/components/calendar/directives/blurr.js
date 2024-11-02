export default (/** @type {CustomEventInit<any> | undefined} */ node) => {
	const click = (/** @type {{ target: any; defaultPrevented: any; }} */ evt) => {
		// @ts-ignore
		if (!node || node.contains(evt.target) || evt.defaultPrevented) return;
		// @ts-ignore
		node.dispatchEvent(new CustomEvent('blurr', node));
	};

	document.addEventListener('click', click, true);

	return {
		destroy() {
			document.removeEventListener('click', click, true);
		}
	};
};
