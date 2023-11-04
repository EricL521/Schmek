// the actual game!

import { useCallback, useEffect, useState } from 'react';

import Board from './board';
import styles from './game-screen.module.css';
import DeathPopup from './death-popup';

export default function GameScreen({ client, tileSize }) {
	// respawn function
	const respawn = useCallback(() => {
		// add listeners for when board is updated and client respawns
		client.once("initialState", (boardState, headPos) => {
			setBoardState(boardState);
			setHeadPos(headPos);
		});
		client.once("boardInitialized", () => setDead(false));

		// respawn
		client.joinGame();
	}, [client]);

	// add listeners for client events
	useEffect(() => {
		// add listener for when board is updated
		const gameUpdateListener = (boardState, headPos, oldHeadPos) => {
			if (boardState) setBoardState([... boardState]);
			if (oldHeadPos) setOldHeadPos([... oldHeadPos]);
			if (headPos) setHeadPos([... headPos]);
		};
		client.on("gameUpdate", gameUpdateListener);

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
			client.removeListener("gameUpdate", gameUpdateListener);
			client.removeListener("death", deathListener);
			client.removeListener("joinGame", respawn);
		};
	}, [client, respawn]);
	// initialize board state and head position to client's
	const [boardState, setBoardState] = useState(client?.boardState);
	const [oldHeadPos, setOldHeadPos] = useState(client?.oldHeadPos);
	const [headPos, setHeadPos] = useState(client?.headPos);
	// store death data, and state
	const [deathData, setDeathData] = useState(null);
	const [dead, setDead] = useState(false);

	return (
		<div id={styles['game-screen']}>
			<Board boardState={boardState} oldHeadPos={oldHeadPos} headPos={headPos} tileSize={tileSize}/>

			<DeathPopup show={dead} stats={deathData} respawn={respawn}/> 
		</div>
	);
};