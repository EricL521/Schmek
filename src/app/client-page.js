// this component is rendered client-side ONLY
'use client';

import { useEffect, useState } from 'react';
import Client from './(game-logic)/Client';

import styles from './client-page.module.css';
import themes from './themes.module.css';

import HomeScreen from './(components)/(home-screen)/home-screen';
import ThemeManager from './(components)/theme-manager';
import LoadingScreen from './(components)/(loading-screen)/loading-screen';
import GameScreen from './(components)/(game-screen)/game-screen';

export default function ClientPage() {
	// initialize client and socket
	const [client, setClient] = useState(null);
	useEffect(() => {
		const client = new Client();
		setClient(client);
		
		return () => client.disconnect();
	}, []); 
	
	// get theme from localStorage, default to light
	// can be dark, light, or system
	const updateTheme = (theme) => {
		setTheme(theme);
		// store theme in localStorage
		localStorage.setItem('theme', theme);
	};
	const [currentTheme, setTheme] = useState(
		(typeof localStorage !== 'undefined') && localStorage.getItem('theme') || 'light'
	);
	const getActualTheme = (theme) => {
		if (theme === 'dark') return 'dark';
		else if (theme === 'light') return 'light';
		else return window.matchMedia('(prefers-color-scheme: dark)').matches? 'dark': 'light';
	};
	// actualTheme is either dark or light, depending on currentTheme and system theme
	const [actualTheme, setActualTheme] = useState(getActualTheme(currentTheme));
	// update actual theme when current theme changes
	useEffect(() => {
		setActualTheme(getActualTheme(currentTheme));
		if (currentTheme !== 'system') return; // don't add listener if theme is not system

		// add listener for when system theme changes
		const listener = () => {
			setActualTheme(getActualTheme(currentTheme));
			console.log('system theme changed');
		};
		const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQueryList.addEventListener('change', listener);
		// return a function to remove listener
		return () => {
			mediaQueryList.removeEventListener('change', listener);
		};
	}, [currentTheme]);

	const [currentPage, setCurrentPage] = useState('home'); // ['home', 'loading-screen', 'game-screen]

	// called when user clicks play on home screen
	const onPlay = (name) => {
		setCurrentPage('loading-screen');
		
		// add listener for when board is initialized
		client.once("initializeBoard", (boardState, headPos) => {
			console.log("Board initialized");
			console.log(boardState);
			console.log(headPos);
			setCurrentPage('game-screen');
		});
		// join game
		client.joinGame(name);
	};
	
	return (
		<main id={styles.main} className={themes[actualTheme]}>
			<div id={styles.content}>
				<ThemeManager theme={currentTheme} setTheme={updateTheme} actualTheme={actualTheme}/>

				{(currentPage == 'home')? 
					<HomeScreen onPlay={onPlay}/> 
				:  (currentPage == 'loading-screen')?
					<LoadingScreen />
				: (currentPage == 'game-screen')?
					<GameScreen />
				: null}
				
			</div>
		</main>
	);
};
