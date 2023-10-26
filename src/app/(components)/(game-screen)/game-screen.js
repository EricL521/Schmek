// the actual game!

import { useEffect, useState } from 'react';

import Board from './board';
import styles from './game-screen.module.css';
import UserInput from '@/app/(game-logic)/user-input';
import DeathPopup from './death-popup';

export default function GameScreen({ client, tileSize }) {
	// add listeners for client events
	useEffect(() => {
		const gameUpdateListener = (boardState, headPos) => {
			setBoardState([... boardState]);
			if (headPos)
				setHeadPos([... headPos]);
		};
		// add listener for when board is updated
		client.on("gameUpdate", gameUpdateListener);

		const deathListener = (data) => {
			setDead(true);
			setDeathData(data);
		};
		// add listener for when snake dies
		client.on("death", deathListener);

		// return function to remove listeners
		return () => {
			client.removeListener("gameUpdate", gameUpdateListener);
			client.removeListener("death", deathListener);
		};
	}, [client]);
	// initialize board state and head position to client's
	const [boardState, setBoardState] = useState(client?.boardState);
	const [headPos, setHeadPos] = useState(client?.headPos);
	// store death data, and state
	const [deathData, setDeathData] = useState(null);
	const [dead, setDead] = useState(false);

	// respawn function
	const respawn = () => {
		// add listeners for when board is updated and client respawns
		client.once("boardState", (boardState, headPos) => {
			setBoardState(boardState);
			setHeadPos(headPos);
		});
		client.once("boardInitialized", () => setDead(false));

		// respawn
		client.respawn();
	};

	return (
		<div id={styles['game-screen']}>
			<UserInput client={client}/>

			<Board boardState={boardState} headPos={headPos} tileSize={tileSize}/>

			<DeathPopup show={dead} stats={deathData} respawn={respawn}/> 
		</div>
	);
};