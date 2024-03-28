// renders a single tile
// also handles the transition animation

import { useCallback, useEffect, useMemo, useRef } from "react";

import style from "./board.module.css";

// travelSpeed is how long it takes the snake to move one grid space IN SECONDS
// board is used to get the new tail when necessary (see tail animation)
// also because of how these are rendered, they are essetially being initialized every time
export default function BoardTile({ tileID, tile, board, tileSize, travelSpeed }) {
	const getTileSizeStyle = useCallback(() => ({
		width: tileSize + 'px',
		height: tileSize + 'px',
	}), [tileSize]);
	// these styles are the styles before any animations
	const getTileStyle = useCallback((tile) => ({
		transition: 'none',
		backgroundColor: tile.color?? 'transparent',
		scale: tile.size ?? 1,
		borderRadius: tile.borderRadius?.map(x => x/100*tileSize + 'px').join(' '),
		... (
			(!tile.animated && (tile.isHead || tile.isTail))?
			{ transform: 'translate(' + -tile.directionIn[0] * 100 + '%, ' 
				+ -tile.directionIn[1] * 100 + '%)' }
			: {}
		)
	}), [tileSize, travelSpeed]);
	const getOldTileStyle = useCallback((oldTile, currentTile) => ({
		... getTileStyle(oldTile),
		... (
			(!currentTile.animated && (currentTile.isHead || currentTile.isTail))?
			{ transform: 'translate(' + -currentTile.directionIn[0] * 100 + '%, ' 
				+ -currentTile.directionIn[1] * 100 + '%)' }
			: {}
		)
	}), [getTileStyle]);
	// tileContainerStyle is the style of the div of the entire tile (not the tileClip)
	const getTileContainerStyle = useCallback((tile) => ({
		... getTileSizeStyle(),
		// get position of tile
		left: tile.position[0] * tileSize + 'px',
		top: tile.position[1] * tileSize + 'px',
	}), [getTileSizeStyle, tileSize]);

	// returns the initial state of tile before animations
	const initialTileStyle = useMemo(() => {
		if (tile.animated) return getTileStyle(tile);
		if (tile.isHead) return getTileStyle(tile);
		if (tile.oldTile.type && tile.isTail) {
			// get style of old tail
			const oldTail = board[tile.position[1] - tile.directionIn[1]]
				[tile.position[0] - tile.directionIn[0]].oldTile;
			return getOldTileStyle(oldTail, tile);
		}
		// otherwise, just return old tile style if it exists
		if (tile.oldTile.type) return getOldTileStyle(tile.oldTile, tile);
		// if old tile doesn't exist, then just return tile style
		return getTileStyle(tile);
	}, [tile, board, getTileStyle, getOldTileStyle]);

	// calculate size of tile clip (extra padding)
	const tileClipSizeStyle = useMemo(() => ({
		... (
			// if tile is not head or tail, don't extend clip box
			!(tile.isHead || tile.isTail)? { padding: 0, margin: 0 }
			: tile.directionIn[0] == 1? {paddingLeft: tileSize + 'px', marginLeft: -tileSize + 'px'}
			: tile.directionIn[0] == -1? {paddingRight: tileSize + 'px'}
			: tile.directionIn[1] == 1? {paddingTop: tileSize + 'px', marginTop: -tileSize + 'px'}
			: tile.directionIn[1] == -1? {paddingBottom: tileSize + 'px'}
			: { padding: 0, margin: 0 }
		)
	}), [tileSize, tile]);
	// get initial borderradius of tile clip
	const tileClipInitialBorderRadiusStyle = useMemo(() => {
		// if tile is head, get border radius of old head tile
		if (tile.isHead) {
			const oldHead = board[tile.position[1] - tile.directionIn[1]]
				[tile.position[0] - tile.directionIn[0]].oldTile;
			if (oldHead) return {
				borderRadius: oldHead.borderRadius.map(x => x/100*tileSize + 'px').join(' ')
			}
		}
		// otherwise, initial clipping border radius is 0
		return { borderRadius: 0 };
	}, [board, tile, tileSize]);
	// returns initial state of tile clip before animations
	const tileClipInitialStyle = useMemo(() => ({
		transition: 'none',
		...tileClipSizeStyle,
		...tileClipInitialBorderRadiusStyle
	}), [tileClipSizeStyle, tileClipInitialBorderRadiusStyle]);

	// start necessary transitions, when tile has changed
	const tileElement = useRef(null);
	const tileElementClip = useRef(null);
	const oldTileElement = useRef(null);

	// run following before render:
	useMemo(() => {
		// basically, if the elements already exist, then just set html again
		if (tileElement.current) Object.assign(initialTileStyle);
		if (tileElementClip.current) Object.assign(tileClipInitialStyle);
	}, [tile]);
	// run following after render:
	useEffect(() => {
		if (tile.animated) return;

		// note for all animations:
		// style is set to the final state before animation, so that fill: 'backwards' can be used
		// this needs to be done so it can be overriden later (for some reason you can't override fill: 'forwards')

		// animate old tile to new if new tile is tail
		if (tile.isTail) {
			tile.animated = true;

			// get the old tail
			const oldTail = board[tile.position[1] - tile.directionIn[1]]
				[tile.position[0] - tile.directionIn[0]].oldTile;
			// animate old tile only if there was an old tail
			if (oldTail) {
				// animate new tile
				Object.assign(tileElement.current.style, {
					... getTileStyle(tile),
					transform: 'translate(0, 0)'
				});
				tileElement.current.animate([
					initialTileStyle,
					{
						... getTileStyle(tile),
						transform: 'translate(0, 0)'
					}
				], {
					duration: travelSpeed * 1000,
					easing: 'linear',
					fill: 'backwards'
				});

				// animate oldTile border radius to the tail's
				if (tile.oldTile?.type) {
					oldTileElement.current.style.borderRadius = tile.borderRadius.map(x => x/100*tileSize + 'px').join(' ');
					oldTileElement.current.animate([
						{ borderRadius: (tile.oldTile?.borderRadius?? [0, 0, 0, 0]).map(x => x/100*tileSize + 'px').join(' ') },
						{ borderRadius: tile.borderRadius.map(x => x/100*tileSize + 'px').join(' ') }
					], {
						duration: travelSpeed * 1000,
						easing: 'linear',
						fill: 'backwards'
					});
				}
			}
		}
		// if tile is a head, animate it in, and animate tile clip properly
		else if (tile.isHead) {
			tile.animated = true;

			// current tile at the oldHead position
			const oldHead = board[tile.position[1] - tile.directionIn[1]]
				[tile.position[0] - tile.directionIn[0]];
			if (oldHead) {
				// animate transform and also width or height, depending on direction
				tileElement.current.style.transform = 'translate(0, 0)';
				tileElement.current.animate([
					{
						transform: 'translate(' + -tile.directionIn[0] * 100 + '%, ' 
							+ -tile.directionIn[1] * 100 + '%)'
					},
					{ 
						transform: 'translate(0, 0)' 
					}
				], {
					duration: travelSpeed * 1000,
					easing: 'linear',
					fill: 'backwards'
				});

				// animate tile clipping to mimic oldHead tile's border radius animation
				tileElementClip.current.style.borderRadius = oldHead.borderRadius.map(x => x/100*tileSize + 'px').join(' ');
				tileElementClip.current.animate([
					{ borderRadius: (oldHead.oldTile?.borderRadius?? [0, 0, 0, 0]).map(x => x/100*tileSize + 'px').join(' ') },
					{ borderRadius: oldHead.borderRadius.map(x => x/100*tileSize + 'px').join(' ') }
				], {
					duration: travelSpeed * 1000,
					easing: 'linear',
					fill: 'backwards'
				});
			}
		}
		// otherwise, just animate from old tile to new tile
		else if (tile.oldTile.type) {
			tile.animated = true;

			Object.assign(tileElement.current.style, getTileStyle(tile));
			tileElement.current.animate([
				getOldTileStyle(tile.oldTile, tile),
				getTileStyle(tile)
			], {
				duration: travelSpeed * 1000,
				easing: 'linear',
				fill: 'backwards'
			});
		}
	}, [tile]);

	return (
		<div id={tile.isHead + ' ' + tileID} style={getTileContainerStyle(tile)} className={style['tile-container']}>
			{/* Keep showing old tile if the head ate an apple, or if the tail is moving in */}
			{ (!tile.animated && ((tile.oldTile.type && tile.isTail) || (tile.oldTile.type === "food" && tile.isHead)))?
				<div className={style['tile-clip']} id="old-tile">
					<div ref={oldTileElement} className={style['tile']} 
						style={getTileStyle(tile.oldTile)} />
				</div>
			: null }
			{/* render tile (and clip if necessary) */}
			<div ref={tileElementClip} className={style['tile-clip']} 
				style={tileClipInitialStyle}>
				<div ref={tileElement} className={style['tile']} 
					style={initialTileStyle} />
			</div>
		</div>
	);
};
