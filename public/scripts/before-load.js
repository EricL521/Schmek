// this runs when the page is loaded
// runs BEFORE DOM is loaded

const updateBackground = () => {
	// get theme
	const theme = localStorage.getItem('theme') ?? 'system';
	
	if (theme === 'dark') document.body.style.backgroundColor = "black";
	else if (theme === 'light') document.body.style.backgroundColor = "white";
	else document.body.style.backgroundColor = window.matchMedia('(prefers-color-scheme: dark)').matches? 'black': 'white';
}

// update document background to match theme when window is loaded
document.addEventListener('DOMContentLoaded', updateBackground);

// if document is already loaded, run code
if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive")
	updateBackground()