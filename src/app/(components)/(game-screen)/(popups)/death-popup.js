// pops up when you die, and allows you to respawn
'use client'

import { useCallback, useEffect, useState } from 'react';
import { unFocus } from '../../unFocus';

import styles from './death-popup.module.css';

export default function DeathPopup({ client }) {
	// function for respawning
	const respawn = useCallback(() => {
		// add listeners for when board is initialized
		client.once("boardInitialized", () => setDead(false));

		// respawn
		client.joinGame();
	}, [client]);
	// add listeners for client events
	useEffect(() => {
		// add listener for when snake dies
		const deathListener = (data) => {
			setDead(true);
			setDeathData(data);
		};
		client.on("death", deathListener);

		// add listener for respawning
		client.on("joinGame", respawn);

		// return function to remove listeners
		return () => {
			client.removeListener("death", deathListener);
			client.removeListener("joinGame", respawn);
		};
	}, [client, respawn]);
	// store death data, and state
	const [deathData, setDeathData] = useState(null);
	const [dead, setDead] = useState(false);
	
	const onButtonClick = () => {
		unFocus();
		respawn();
	};

	return (
		<div id={styles['death-popup']} className={[styles['interactive'], dead ? "" : styles['hidden']].join(" ")}>
			<div id={styles['text-div']}>
				<h1 className={styles['interactive']}>You died :(</h1>
				<p className={styles['interactive']}>Total Length: {deathData?.length}</p>
			</div>
			<button className={styles['interactive']} onClick={onButtonClick}>Respawn</button>
		</div>
	);
};
