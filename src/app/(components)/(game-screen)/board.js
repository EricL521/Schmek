// component that renders the board

import { useMemo } from "react";

import style from "./board.module.css";

import BoardRow from "./board-row";

// boardstate is a 2d array of tiles{position[2], color}
// headpos is just [x, y]
export default function Board({ boardState, headPos, tileSize }) {
	// offset board to make headPos the center
	const boardStyle = useMemo(() => ({
		left: 'calc( 50% - ' + (headPos[0] + 0.5) * tileSize + 'px )',
		top: 'calc( 50% - ' + (headPos[1] + 0.5) * tileSize + 'px )',
	}), [headPos, tileSize]);
	
	// generate table
	const rows = boardState.map((row, index) =>
		<BoardRow key={index} row={row} tileSize={tileSize} />
	);
	return (
		<table style={boardStyle} id={style['board']}>
			<tbody>
				{rows}
			</tbody>
		</table>
	);
};