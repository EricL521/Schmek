// home page
'use client'

import { useState } from 'react';

import styles from './home.module.css'

export default function Home({onPlay}) {
	const [name, setName] = useState('Unnamed Schmeker');
	const onButtonClick = () => {
		onPlay(name);
	};

	return (
		<div id={styles.home} className={styles.interactive}>
			<div id={styles.title}>
				<h1 className={styles.interactive}>Schmek</h1>
				<sub className={styles.interactive}>A simple snake<br />game with abilities</sub>
			</div>
			<input id={styles["name-input"]} className={styles.interactive} 
				type="text" placeholder="Your Username" value={name}
				onChange={e => setName(e.target.value)}></input>
			<button id={styles["play-button"]} onClick={onButtonClick}>Play</button>
		</div>
	)
};