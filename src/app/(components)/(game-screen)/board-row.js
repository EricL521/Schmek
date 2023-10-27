// renders one row of the board

import style from "./board.module.css";

export default function BoardRow({ row, tileSize }) {
	const getTileStyle = (tile) => ({
		width: tileSize + 'vh',
		height: tileSize + 'vh',
		backgroundColor: tile.color,
		scale: tile.size !== 1 ? tile.size : null,
		borderRadius: tile.borderRadius.map(x => x + '%').join(' ')
	});
	const getTileKey = (tile) => tile.type + ' ' + tile.position.join(',');
	
	// generate row tiles
	const tiles = row.map(tile => 
		<td key={getTileKey(tile)} id={getTileKey(tile)} style={getTileStyle(tile)} className={style["tile"]} />	
	);

	return (
		<tr className={style['row']}>
			{tiles}
		</tr>
	);
};