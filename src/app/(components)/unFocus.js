// unfocuses active element if it wasn't selected with tab
export const unFocus = () => {
	if (!document.activeElement.matches("*:focus-visible"))
		document.activeElement.blur();
};