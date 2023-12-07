// renders one row of the board

import BoardTile from "./board-tile";

import style from "./board.module.css";

// travelSpeed is how long it takes the snake to move one grid space
// IN SECONDS
export default function BoardRow({ board, row, tileSize, travelSpeed }) {
	const getTileKey = (tile) => tile.position.join(',');
	// generate row tiles
	const tiles = row.map(tile => 
		<BoardTile key={getTileKey(tile)} tileID={getTileKey(tile)} 
			board={board} tile={tile} tileSize={tileSize} travelSpeed={travelSpeed} />
	);

	return (
		<div className={style['row']}>
			{tiles}
		</div>
	);
};
