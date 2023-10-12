// the actual game!

import Board from './board';
import styles from './game-screen.module.css';

export default function GameScreen({ boardState, headPos, tileSize }) {
	return (
		<div id={styles['game-screen']}>
			<Board boardState={boardState} headPos={headPos} tileSize={tileSize}/>
		</div>
	);
};