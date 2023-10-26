// the actual game!

import { useEffect, useState } from 'react';

import Board from './board';
import styles from './game-screen.module.css';
import UserInput from '@/app/(game-logic)/user-input';
import DeathPopup from './death-popup';

export default function GameScreen({ client, tileSize }) {
	// add listeners for client events
	useEffect(() => {
		const boardStateListener = (boardState, headPos) => {
			setBoardState(boardState);
			setHeadPos(headPos);
		};
		// add listener for when board is updated
		client.on("gameUpdate", boardStateListener);

		const deathListener = (data) => {
			setDead(true);
			setDeathData(data);
		};
		// add listener for when snake dies
		client.on("death", deathListener);

		// return function to remove listeners
		return () => {
			client.removeListener("gameUpdate", boardStateListener);
			client.removeListener("death", deathListener);
		};
	}, [client]);
	// store board state and head position to pass to board component
	const [boardState, setBoardState] = useState(client?.boardState);
	const [headPos, setHeadPos] = useState(client?.headPos);
	// store death data, and state
	const [deathData, setDeathData] = useState(null);
	const [dead, setDead] = useState(false);

	// respawn function
	const respawn = () => {
		console.log("TODO");
	};

	return (
		<div id={styles['game-screen']}>
			<UserInput client={client}/>

			{(dead)? 
				<DeathPopup stats={deathData} respawn={respawn}/> 
			: null}
			<Board boardState={boardState} headPos={headPos} tileSize={tileSize}/>
		</div>
	);
};