/**
 * Apply this directive to any element to detect click outside of that element.
 * @param node node to apply the directive to
 * @returns {object} The directive
 */
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
