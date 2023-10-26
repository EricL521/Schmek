/* eslint-disable @next/next/no-img-element */

// sets theme to light or dark mode
'use client';

import { unFocus } from './unFocus';

import style from './theme-manager.module.css';

export default function ThemeManager({theme, setTheme, autoHide = true}) {

	return (
		<div id={style["theme-manager"]} className={autoHide? null: style["visible"]}>
			<button onClick={() => {setTheme('light'); unFocus();}} id={style["light"]} 
			className={[style['interactive'], theme == "light" && style['selected']].join(" ")}>
				<img src="./icons/light-mode.svg" alt="Light Theme" draggable="false"/>
			</button>
			<button onClick={() => {setTheme('system'); unFocus();}} id={style["system"]} 
			className={[style['interactive'], theme == "system" && style['selected']].join(" ")}>
				<img src="./icons/system-mode.svg" alt="System Theme" draggable="false"/>
			</button>
			<button onClick={() => {setTheme('dark'); unFocus();}} id={style["dark"]}
			className={[style['interactive'], theme == "dark" && style['selected']].join(" ")}>
				<img src="./icons/dark-mode.svg" alt="Dark Theme" draggable="false"/>
			</button>
		</div>
	);
};