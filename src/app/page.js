'use client'
import { useState } from 'react';

import styles from './page.module.css';
import themes from './themes.module.css';

import Home from './(components)/(home-screen)/home';
import ThemeManager from './(components)/theme-manager';
import LoadingScreen from './(components)/(loading-screen)/loading-screen';

export default function Page() {
	const [currentPage, setCurrentPage] = useState('home'); // ['home', 'loading-screen', 'game-screen]
	const [currentTheme, setTheme] = useState('light');

	const onPlay = (name) => {
		console.log(name);
		setCurrentPage('loading-screen');
	};
	
	return (
		<main id={styles.main} className={themes[currentTheme]}>
			<div id={styles.content}>
				<ThemeManager theme={currentTheme} setTheme={setTheme} />
				{(currentPage == 'home')? <Home onPlay={onPlay}/> : null}
				{(currentPage == 'loading-screen')? <LoadingScreen /> : null}
			</div>
		</main>
	);
};
