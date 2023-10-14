// home page
'use client'

import { useState } from 'react';

import styles from './home.module.css'

export default function HomeScreen({onPlay}) {
	const [name, setName] = useState('Unnamed Schmeker');
	const [color, setColor] = useState('#ca97d7');
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
					onChange={e => setName(e.target.value)} />
				<input id={styles['color-input']} type="color"
					value={color} onChange={e => setColor(e.target.value)}/>
				<label for={styles['color-input']} id={styles['color-label']} className={styles['interactive']} 
					style={{backgroundColor: color}} />
			</div>
			<button id={styles["play-button"]} onClick={onButtonClick}>Play</button>
		</div>
	);
};