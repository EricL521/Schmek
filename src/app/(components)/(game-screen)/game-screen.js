// the actual game!

import { useEffect, useState } from 'react';

import Board from './board';
import styles from './game-screen.module.css';
import UserInput from '@/app/(game-logic)/user-input';

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
	// store board state and head position to pass to board component
	const [boardState, setBoardState] = useState(client?.boardState);
	const [headPos, setHeadPos] = useState(client?.headPos);

	return (
		<div id={styles['game-screen']}>
			<UserInput client={client}/>

			<Board boardState={boardState} headPos={headPos} tileSize={tileSize}/>
		</div>
	);
};