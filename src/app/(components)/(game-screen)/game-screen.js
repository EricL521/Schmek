// the actual game!

import { useEffect, useState } from 'react';

import Board from './board';
import styles from './game-screen.module.css';

export default function GameScreen({ client, tileSize }) {
	// add listener for when board state is updated
	useEffect(() => {
		const boardStateListener = (boardState, headPos) => {
			setBoardState(boardState);
			setHeadPos(headPos);
		};
		// add listener for when board is updated
		client.on("gameUpdate", boardStateListener);

		// return function to remove listener
		return () => client.removeListener("gameUpdate", boardStateListener);
	}, [client]);

	// create some variables to store board state and head position
	const [boardState, setBoardState] = useState(client?.boardState);
	const [headPos, setHeadPos] = useState(client?.headPos);

	return (
		<div id={styles['game-screen']}>
			<Board boardState={boardState} headPos={headPos} tileSize={tileSize}/>
		</div>
	);
};