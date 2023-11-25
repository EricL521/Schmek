// renders one row of the board

import style from "./board.module.css";

export default function BoardRow({ row, tileSize }) {
	const getTileStyle = (tile) => ({
		width: tileSize + 'px',
		height: tileSize + 'px',
		backgroundColor: tile.color,
		scale: tile.size !== 1 ? tile.size : null,
		borderRadius: tile.borderRadius.map(x => x + '%').join(' ')
	});
	const getTileKey = (tile) => tile.type + ' ' + tile.position.join(',');
	
	// generate row tiles
	const tiles = row.map(tile => 
		<div key={getTileKey(tile)} id={getTileKey(tile)} style={getTileStyle(tile)} className={style["tile"]} />	
	);

	return (
		<div className={style['row']}>
			{tiles}
		</div>
	);
};