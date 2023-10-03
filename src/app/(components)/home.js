// home page
'use client'

import styles from './home.module.css'

export default function Home() {
	return (
		<div id={styles.home} className={styles.interactive}>
			<div id={styles.title}>
				<h1 className={styles.interactive}>Schmek</h1>
				<sub className={styles.interactive}>A simple snake<br />game with abilities</sub>
			</div>
			<input id={styles["name-input"]} className={styles.interactive} 
				type="text" placeholder="Your Username" defaultValue="Unnamed Schmeker"></input>
			<button id={styles["play-button"]}>Play</button>
		</div>
	)
};