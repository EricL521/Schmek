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
	let client;
	useEffect(() => {
		client = new Client();
		return () => {client.socket.disconnect()};
	}, []);

	const [currentPage, setCurrentPage] = useState('home'); // ['home', 'loading-screen', 'game-screen]
	
	// get theme from localStorage, default to light
	const [currentTheme, setTheme] = useState(
		(typeof localStorage !== 'undefined') && localStorage.getItem('theme') || 'light'
	);
	const updateTheme = (theme) => {
		setTheme(theme);
		// store theme in localStorage
		localStorage.setItem('theme', theme);
	};

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
		<main id={styles.main} className={themes[currentTheme]}>
			<div id={styles.content}>
				<ThemeManager theme={currentTheme} setTheme={updateTheme} />

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
