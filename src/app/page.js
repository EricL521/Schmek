'use client'
import { useState } from 'react';

import styles from './page.module.css';
import themes from './themes.module.css';

import Home from './(components)/home';
import ThemeManager from './(components)/theme-manager';

export default function Page() {
	const [currentTheme, setTheme] = useState('light');
	
	return (
		<main id={styles.main} className={themes[currentTheme]}>
			<div id={styles.content}>
				<ThemeManager theme={currentTheme} setTheme={setTheme} />
				<Home />
			</div>
		</main>
	);
};
