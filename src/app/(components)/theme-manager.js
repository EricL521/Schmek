// sets theme to light or dark mode
'use client';

import style from './theme-manager.module.css';

export default function ThemeManager({theme, setTheme}) {
	return (
		<div id={style["theme-manager"]}>
			<img src="./icons/light-mode.svg" onClick={() => setTheme('light')} draggable="false"
				className={[style.interactive, theme == "light" && style.active].join(" ")}></img>
			<img src="./icons/system-mode.svg" onClick={() => setTheme('system')} draggable="false"
				className={[style.interactive, theme == "system" && style.active].join(" ")}></img>
			<img src="./icons/dark-mode.svg" onClick={() => setTheme('dark')} draggable="false"
				className={[style.interactive, theme == "dark" && style.active].join(" ")}></img>
		</div>
	);
};