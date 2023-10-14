// home page
'use client'

import { useState } from 'react';

import styles from './home.module.css'

export default function HomeScreen({onPlay}) {
	const [name, setName] = useState(localStorage.getItem('name') ?? 'Unnamed Schmeker');
	// this function updates the name and localStorage
	const updateName = (newName) => {
		// set name and update localStorage
		setName(newName);
		localStorage.setItem('name', newName);
	};
	const [color, setColor] = useState(localStorage.getItem('color') ?? '#ca97d7');
	// this function updates the color and localStorage
	const updateColor = (newColor) => {
		// set color and update localStorage
		setColor(newColor);
		localStorage.setItem('color', newColor);
	};

	const onButtonClick = () => {
		onPlay(name, color);
	};

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
				<input id={styles['color-input']} type="color"
					value={color} onChange={e => updateColor(e.target.value)}/>
				<label for={styles['color-input']} id={styles['color-label']} className={styles['interactive']} 
					style={{backgroundColor: color}} />
			</div>
			<button id={styles["play-button"]} onClick={onButtonClick}>Play</button>
		</div>
	);
};