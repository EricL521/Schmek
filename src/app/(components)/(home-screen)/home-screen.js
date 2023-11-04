// home page
'use client'

import { useCallback, useEffect, useState } from 'react';
import { unFocus } from '../unFocus';

import styles from './home.module.css'

export default function HomeScreen({ client, setPage }) {
	const [name, setName] = useState(localStorage.getItem('name') ?? 'Unnamed Schmeker');
	// this function updates the name and localStorage
	const updateName = useCallback((newName) => {
		// set name and update localStorage
		setName(newName);
		localStorage.setItem('name', newName);
	}, []);
	const [color, setColor] = useState(localStorage.getItem('color') ?? '#ca97d7');
	// this function updates the color and localStorage
	const updateColor = useCallback((newColor) => {
		// set color and update localStorage
		setColor(newColor);
		localStorage.setItem('color', newColor);
	}, []);

	const joinGame = useCallback((name, color) => {
		// set page
		setPage('loading-screen');
		// set name and color
		client.setName(name);
		client.setColor(color);
	}, [client, setPage]);
	// also add listener to client for joinGame
	useEffect(() => {
		// if client is null, return
		if (!client) return;

		// otherwise add listener
		const joinGameListener = () => joinGame(name, color);
		client.once('joinGame', joinGameListener);
		// remove listener when component unmounts
		return () => client.removeListener('joinGame', joinGameListener);
	}, [client, joinGame, name, color]);

	return (
		<div id={styles['home']} className={styles['interactive']}>
			<div id={styles['title']}>
				<h1 className={styles['interactive']}>Schmek</h1>
				<sub className={styles['interactive']}>A simple snake<br />game with abilities</sub>
			</div>
			<div id={styles["input-div"]}>
				<input id={styles['name-input']} className={styles['interactive']} 
					type="text" placeholder="Your Username" value={name}
					onChange={e => updateName(e.target.value)} />
				<label id={styles['color-label']} className={styles['interactive']} 
					style={{backgroundColor: color}}>
					<input id={styles['color-input']} type="color" onClick={unFocus}
						value={color} onChange={e => updateColor(e.target.value)}/>
				</label>
			</div>
			<button id={styles["play-button"]} onClick={() => {joinGame(name, color); unFocus();}}>
				Play
			</button>
		</div>
	);
};