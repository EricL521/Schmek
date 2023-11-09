// sets theme to light or dark mode
'use client';

import { useMemo } from 'react';
import { unFocus } from './unFocus';

import defaultStyle from './theme-manager.module.css';

import Image from 'next/image';

export default function ThemeManager({ customStyle, theme, setTheme, autoHide = true }) {
	const style = useMemo(() => {
		return customStyle?? defaultStyle;
	}, [customStyle]);

	return (
		<div id={style["theme-manager"]} className={autoHide? null: style["visible"]}>
			<button onClick={() => {setTheme('light'); unFocus();}} id={style["light"]} 
			className={[style['interactive'], theme == "light" && style['selected']].join(" ")}>
				<Image src="./icons/light-mode.svg" alt="Light Theme" draggable="false" width={1000} height={1000}/>
			</button>
			<button onClick={() => {setTheme('system'); unFocus();}} id={style["system"]} 
			className={[style['interactive'], theme == "system" && style['selected']].join(" ")}>
				<Image src="./icons/system-mode.svg" alt="System Theme" draggable="false" width={1000} height={1000}/>
			</button>
			<button onClick={() => {setTheme('dark'); unFocus();}} id={style["dark"]}
			className={[style['interactive'], theme == "dark" && style['selected']].join(" ")}>
				<Image src="./icons/dark-mode.svg" alt="Dark Theme" draggable="false" width={1000} height={1000}/>
			</button>
		</div>
	);
};