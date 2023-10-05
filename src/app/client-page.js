'use client'
// this component is rendered client-side only

import { useState } from 'react';

import styles from './client-page.module.css';
import themes from './themes.module.css';

import Home from './(components)/(home-screen)/home';
import ThemeManager from './(components)/theme-manager';
import LoadingScreen from './(components)/(loading-screen)/loading-screen';

export default function ClientPage() {
	const [currentPage, setCurrentPage] = useState('home'); // ['home', 'loading-screen', 'game-screen]
	
	// get theme from localStorage, default to light
	const [currentTheme, setTheme] = useState(
		(typeof localStorage !== 'undefined')? localStorage.getItem('theme') ?? 'light' : 'light'
	);
	const updateTheme = (theme) => {
		setTheme(theme);
		// store theme in localStorage
		localStorage.setItem('theme', theme);
	};

	const onPlay = (name) => {
		console.log(name);
		setCurrentPage('loading-screen');
	};
	
	return (
		<main id={styles.main} className={themes[currentTheme]}>
			<div id={styles.content}>
				<ThemeManager theme={currentTheme} setTheme={updateTheme} />

				{(currentPage == 'home')? 
					<Home onPlay={onPlay}/> 
				:  (currentPage == 'loading-screen')?
					<LoadingScreen />
				: (currentPage == 'game-screen')?
					<GameScreen />
				: null}
				
			</div>
		</main>
	);
};
