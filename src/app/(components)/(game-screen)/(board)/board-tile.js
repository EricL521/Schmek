// renders a single tile
// also handles the transition animation

import { useCallback, useMemo, useRef } from "react";

import style from "./board.module.css";

// travelSpeed is how long it takes the snake to move one grid space IN SECONDS
// board is used to get the new tail when necessary (see tail animation)
export default function BoardTile({ tileID, tile, board, tileSize, travelSpeed }) {
	const getTileSizeStyle = useCallback(() => ({
		width: tileSize + 'px',
		height: tileSize + 'px',
	}), [tileSize]);
	// tileStyle includes tileSizeStyle and adds a couple more things
	const getTileStyle = useCallback((tile) => ({
		backgroundColor: tile.color?? 'transparent',
		scale: tile.size ?? 1,
		borderRadius: tile.borderRadius?.map(x => x/100*tileSize + 'px').join(' '),
		transitionDuration: travelSpeed + 's',
		transitionTimingFunction: 'linear',
		transitionProperty: (tile.isHead)? 'none' : 'border-radius'
	}), [tileSize, travelSpeed]);
	// tileParentStyle is the style of the parent div
	const getTileContainerStyle = useCallback(() => ({
		... getTileSizeStyle()
	}), [getTileSizeStyle]);

	// start necessary transitions, when tile has changed
	const tileElement = useRef(null);
	const tileElementClip = useRef(null);
	const oldTileElement = useRef(null);
	// calculate size of tile clip
	const tileClipSizeStyle = useMemo(() => ({
		... (
			!tile.isHead? {}
			: tile.directionIn[0] == 1? {paddingLeft: tileSize + 'px', marginLeft: -tileSize + 'px'}
			: tile.directionIn[0] == -1? {paddingRight: tileSize + 'px'}
			: tile.directionIn[1] == 1? {paddingTop: tileSize + 'px', marginTop: -tileSize + 'px'}
			: tile.directionIn[1] == -1? {paddingBottom: tileSize + 'px'}
			: {}
		),
	}), [tileSize, tile]);
	// calculate size of old tile clip
	const oldTileClipSizeStyle = useMemo(() => ({
		... (
			!tile.oldTile?.isTail? {}
			: tile.oldTile.directionOut[0] == 1? {paddingRight: tileSize + 'px'}
			: tile.oldTile.directionOut[0] == -1? {paddingLeft: tileSize + 'px', marginLeft: -tileSize + 'px'}
			: tile.oldTile.directionOut[1] == 1? {paddingBottom: tileSize + 'px'}
			: tile.oldTile.directionOut[1] == -1? {paddingTop: tileSize + 'px', marginTop: -tileSize + 'px'}
			: {}
		)
	}), [tileSize, tile]);
	// run following before render:
	useMemo(() => {
		const oldTile = tile.oldTile;

		// if old tile was a tail, animate it out, and animate style to new tail
		if (oldTile?.isTail) {
			// get the new tail
			const newTail = board[oldTile.position[1] + oldTile.directionOut[1]]
				[oldTile.position[0] + oldTile.directionOut[0]];
			// animate old tile out
			oldTileElement.current?.animate([
				{
					... getTileStyle(oldTile),
					visibility: 'visible', // make tile appear before animation
					transform: 'translate(0, 0)'
				},
				{
					... getTileStyle(newTail),
					visibility: 'hidden', // make tile disappear after animation
					transform: 'translate(' + oldTile.directionOut[0] * 100 + '%, ' 
						+ oldTile.directionOut[1] * 100 + '%)'
				}
			], {
				duration: travelSpeed * 1000,
				easing: 'linear',
				fill: 'forwards'
			}).addEventListener('finish', () => tile.animated = true);	
		}

		// if tile is a head, animate it in, and animate tile clip properly
		if (tile.isHead) {
			// animate transform and also width or height, depending on direction
			tileElement.current?.animate([
				{ transform: 'translate(' + -tile.directionIn[0] * 100 + '%, ' 
					+ -tile.directionIn[1] * 100 + '%)'},
				{ transform: 'translate(0, 0)' }
			], {
				duration: travelSpeed * 1000,
				easing: 'linear',
				fill: 'forwards'
			}).addEventListener('finish', () => tile.animated = true);	

			// animate tile clipping to mimic oldHead tile
			const oldHead = board[tile.position[1] - tile.directionIn[1]]
				[tile.position[0] - tile.directionIn[0]];
			tileElementClip.current?.animate([
				{ ...tileClipSizeStyle, borderRadius: (oldHead.oldTile?.borderRadius?? [0, 0, 0, 0]).map(x => x/100*tileSize + 'px').join(' ') },
				{ ...tileClipSizeStyle, borderRadius: oldHead.borderRadius.map(x => x/100*tileSize + 'px').join(' ') }
			], {
				duration: travelSpeed * 1000,
				easing: 'linear',
				fill: 'backwards'
			});
		}
	}, [tile]);

	return (
		<div id={tileID} style={getTileContainerStyle()} className={style['tile-container']}>
			{/* Check if tile is tail to prepare to animate oldTile next frame, or show apple if it is one */}
			{ (!tile.animated && tile.oldTile?.isTail || tile.isTail || 
				(tile.oldTile?.type === "food" && tile.type !== "food"))?
				<div className={style['tile-clip']} style={oldTileClipSizeStyle}>
					<div ref={oldTileElement} className={style['tile']} 
						style={tile.oldTile?.isTail || tile.oldTile?.type == "food"? 
						getTileStyle(tile.oldTile): {display: 'none'}} />
				</div>
			: null }
			{/* render tile (and clip if necessary) */}
			<div ref={tileElementClip} className={style['tile-clip']}>
				<div ref={tileElement} className={style['tile']} style={getTileStyle(tile)} />
			</div>
		</div>
	);
};