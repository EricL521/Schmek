// this runs when the app is loaded
// runs BEFORE DOM is loaded

// update document background to match theme
// get theme
const theme = localStorage.getItem('theme') ?? 'light';
// set background to black or white when window is loaded
document.addEventListener('DOMContentLoaded', () => {
	document.body.style.backgroundColor = theme === 'dark' ? 'black' : 'white';
});