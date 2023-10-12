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
	// create some variables to store board state and head position
	const [boardState, setBoardState] = useState(null);
	const [headPos, setHeadPos] = useState(null);
	
	// get theme from localStorage, default to light
	// can be dark, light, or system
	const updateTheme = (theme) => {
		setTheme(theme);
		// store theme in localStorage
		localStorage.setItem('theme', theme);
	};
	const [currentTheme, setTheme] = useState(localStorage.getItem('theme') ?? 'system');
	const getActualTheme = (theme) => {
		if (theme === 'dark' || theme === 'light') return theme;
		else return window.matchMedia('(prefers-color-scheme: dark)').matches? 'dark': 'light';
	};
	// actualTheme is either dark or light, depending on currentTheme and system theme
	const [actualTheme, setActualTheme] = useState(getActualTheme(currentTheme));
	// update actual theme when current theme changes
	useEffect(() => {
		setActualTheme(getActualTheme(currentTheme));
		if (currentTheme !== 'system') return; // don't add listener if theme is not system

		// add listener for when system theme changes
		const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQueryList.onchange = () => setActualTheme(getActualTheme(currentTheme));
		// return a function to remove listener
		return () => mediaQueryList.onchange = null;
	}, [currentTheme]);

	const [currentPage, setCurrentPage] = useState('home-screen'); // ['home-screen', 'loading-screen', 'game-screen]

	// called when user clicks play on home screen
	const onPlay = (name) => {
		setCurrentPage('loading-screen');
		
		// add listener for when board is initialized
		client.once("initializeBoard", (boardState, headPos) => {
			setBoardState(boardState);
			setHeadPos(headPos);

			setCurrentPage('game-screen');
		});
		// join game
		client.joinGame(name);
	};
	
	return (
		<main id={styles.main} className={themes[actualTheme]}>
			<div id={styles.content}>
				<ThemeManager theme={currentTheme} setTheme={updateTheme} actualTheme={actualTheme}/>

				{(currentPage == 'home-screen')? 
					<HomeScreen onPlay={onPlay}/> 
				:  (currentPage == 'loading-screen')?
					<LoadingScreen />
				: (currentPage == 'game-screen')?
					<GameScreen boardState={boardState} headPos={headPos} tileSize={50}/>
				: null}
				
			</div>
		</main>
	);
};
