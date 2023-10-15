// renders one row of the board

import style from "./board.module.css";

export default function BoardRow({ row, tileSize }) {
	const getTileStyle = (tile) => ({
		width: tileSize + 'vh',
		height: tileSize + 'vh',
		backgroundColor: tile.color,
	});
	const getTileKey = (tile) => tile.position.join(',');
	
	// generate row tiles
	const tiles = row.map(tile => 
		<td key={getTileKey(tile)} id={getTileKey(tile)} style={getTileStyle(tile)} className={style["tile"]}></td>	
	);

	return (
		<tr className={style['row']}>
			{tiles}
		</tr>
	);
};