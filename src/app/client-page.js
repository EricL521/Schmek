// this component is rendered client-side ONLY
'use client';

import { useEffect, useMemo, useState } from 'react';
import Client from './(game-logic)/Client';

import styles from './client-page.module.css';
import themes from './themes.module.css';

import HomeScreen from './(components)/(home-screen)/home-screen';
import ThemeManager from './(components)/theme-manager';
import LoadingScreen from './(components)/(loading-screen)/loading-screen';
import GameScreen from './(components)/(game-screen)/game-screen';

export default function ClientPage() {
	// initialize client
	const [client, setClient] = useState(null);
	useEffect(() => {
		const client = new Client();
		setClient(client);
		
		return () => client.disconnect();
	}, []); 
	
	// can be dark, light, or system
	const [currentTheme, setTheme] = useState(localStorage.getItem('theme') ?? 'system');
	// updateTheme also stores theme in localStorage
	const updateTheme = (theme) => { setTheme(theme); localStorage.setItem('theme', theme); };
	const [systemTheme, setSystemTheme] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches? 'dark': 'light');
	// watch system theme for changes
	useEffect(() => {
		// add listener for when system theme changes
		const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQueryList.onchange = () => setSystemTheme(mediaQueryList.matches? 'dark': 'light');
		// return a function to remove listener
		return () => mediaQueryList.onchange = null;
	}, []);
	const getActualTheme = (currentTheme, systemTheme) => {
		if (currentTheme === 'dark' || currentTheme === 'light') return currentTheme;
		else return getActualTheme(systemTheme);
	};
	// actualTheme is either dark or light, depending on currentTheme and system theme
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const actualTheme = useMemo(() => getActualTheme(currentTheme, systemTheme), [currentTheme, systemTheme]);

	const [currentPage, setCurrentPage] = useState('home-screen'); // ['home-screen', 'loading-screen', 'game-screen]

	// called when user clicks play on home screen
	const joinGame = (name, color) => {
		setCurrentPage('loading-screen');
		
		// add listener for when board is initialized
		client.once("boardInitialized", () => setCurrentPage('game-screen'));
		// join game
		client.joinGame(name, color);
	};
	
	return (
		<main id={styles.main} className={themes[actualTheme]}>
			<div id={styles.content}>
				<ThemeManager theme={currentTheme} setTheme={updateTheme} autoHide={currentPage !== 'home-screen'}/>

				{(currentPage == 'home-screen')? 
					<HomeScreen joinGame={joinGame}/> 
				:  (currentPage == 'loading-screen')?
					<LoadingScreen />
				: (currentPage == 'game-screen')?
					<GameScreen client={client} tileSize={50}/>
				: null}
				
			</div>
		</main>
	);
};
