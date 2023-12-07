// renders a single tile
// also handles the transition animation

import { useCallback, useEffect, useMemo, useRef } from "react";

import style from "./board.module.css";

// travelSpeed is how long it takes the snake to move one grid space IN SECONDS
// board is used to get the new tail when necessary (see tail animation)
export default function BoardTile({ tileID, tile, board, tileSize, travelSpeed }) {
	// store old tile to transition out if necessary
	const oldTile = useRef(null);
	useEffect(() => {oldTile.current = tile;}, [tile]);

	const getTileSizeStyle = useCallback(() => ({
		width: tileSize + 'px',
		height: tileSize + 'px',
	}), [tileSize]);
	// tileStyle includes tileSizeStyle and adds a couple more things
	const getTileStyle = useCallback((tile) => ({
		... getTileSizeStyle(),
		backgroundColor: tile.color?? 'transparent',
		scale: tile.size ?? 1,
		borderRadius: tile.borderRadius?.map(x => x/100*tileSize + 'px').join(' '),
		transitionDuration: travelSpeed + 's',
		transitionTimingFunction: 'linear',
		transitionProperty: (tile.isHead)? 'none' : 'border-radius'
	}), [getTileSizeStyle, tileSize, travelSpeed]);
	// tileParentStyle is the style of the parent div
	// if tile is a head, it will be animated in, so we need to do a bit of clipping
	const getTileParentStyle = useCallback(() => ({
		... getTileSizeStyle()
	}), [getTileSizeStyle]);

	// start necessary transitions, when tile has changed
	const tileElement = useRef(null);
	const oldTileElement = useRef(null);
	// run following before render:
	useMemo(() => {
		// if oldtile and newtile are the same, don't do anything
		if (oldTile.current == tile) return;

		// if old tile was a tail, animate it out, and animate style to new tail
		if (oldTile.current?.isTail) {
			// get the new tail
			const newTail = board[oldTile.current.position[1] + oldTile.current.directionOut[1]]
				[oldTile.current.position[0] + oldTile.current.directionOut[0]];
			// animate old tile out
			oldTileElement.current.animate([
				{
					... getTileStyle(oldTile.current),
					visibility: 'visible', // make tile appear before animation
					transform: 'translate(0, 0)'
				},
				{
					... getTileStyle(newTail),
					visibility: 'hidden', // make tile disappear after animation
					transform: 'translate(' + oldTile.current.directionOut[0] * 100 + '%, ' 
						+ oldTile.current.directionOut[1] * 100 + '%)'
				}
			], {
				duration: travelSpeed * 1000,
				easing: 'linear',
				fill: 'forwards'
			});	
		}

		// if tile is a head, animate it in
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
			});	
		}
	}, [tile, travelSpeed]);

	return (
		<div id={tileID} style={getTileParentStyle()} className={style["tile"]}>
			{/* Check if tile is tail to prepare to animate oldTile next frame, or show apple if it is one */}
			{ (oldTile.current?.isTail || oldTile.current?.type == "food" || tile.isTail)?
				<div ref={oldTileElement} style={oldTile.current?.isTail || oldTile.current?.type == "food"? 
					getTileStyle(oldTile.current): {display: 'none'}} />
			: null }
			<div ref={tileElement} style={getTileStyle(tile)} />
		</div>
	);
};