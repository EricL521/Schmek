// pops up when you die, and allows you to respawn
'use client'

import { unFocus } from '../../unFocus';

import styles from './death-popup.module.css';

export default function DeathPopup({ show, stats, respawn }) {
	const onButtonClick = () => {
		unFocus();
		respawn();
	};

	return (
		<div id={styles['death-popup']} className={[styles['interactive'], show ? "" : styles['hidden']].join(" ")}>
			<div id={styles['text-div']}>
				<h1 className={styles['interactive']}>You died :(</h1>
				<p className={styles['interactive']}>Total Length: {stats?.length}</p>
			</div>
			<button className={styles['interactive']} onClick={onButtonClick}>Respawn</button>
		</div>
	);
};
