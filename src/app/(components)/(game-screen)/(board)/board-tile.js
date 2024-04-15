// renders a single tile
// also handles the transition animation

import { useCallback, useEffect, useMemo, useRef } from "react";

import style from "./board.module.css";

// travelSpeed is how long it takes the snake to move one grid space IN SECONDS
// board is used to get the new tail when necessary (see tail animation)
// also because of how these are rendered, they are essetially being initialized every time
export default function BoardTile({ tileID, tile, board, undergroundBoard, tileSize, travelSpeed }) {
	// returns the current tile that is at the location that this tile came from
	const currentTileAtPreviousPos = useMemo(() => {
		const currentTile = (tile.previousUnderground? undergroundBoard : board)
			[tile.position[1] - tile.directionIn[1]]
			[tile.position[0] - tile.directionIn[0]];
		return currentTile;
	}, [tile, board, undergroundBoard]);
	// returns the tile that this tile came from in the snake
	// for example, if used on the head, it would return the head from last frame
	const previousSnakeTile = useMemo(() => currentTileAtPreviousPos.oldTile, [currentTileAtPreviousPos]);
	
	const getTileSizeStyle = useCallback(() => ({
		width: tileSize + 'px',
		height: tileSize + 'px',
	}), [tileSize]);
	// tileContainerStyle is the style of the div of the entire tile (not the tileClip)
	const getTileContainerStyle = useCallback((tile) => ({
		... getTileSizeStyle(),
		// get position of tile
		left: tile.position[0] * tileSize + 'px',
		top: tile.position[1] * tileSize + 'px',
		// make underground tiles appear below normal tiles
		zIndex: tile.underground? 0 : 1,
	}), [getTileSizeStyle, tileSize]);
	
	// set scale of tile clip to match previous tile size, so the clipping can match
	const tileClipSize = useMemo(() => {
		if (!tile.underground) return 1; // if tile is not underground, don't bother scaling
		// if it is, then the clip should adjust to the previous tile size
		return previousSnakeTile?.size?? 1
	}, [previousSnakeTile]);
	const tileClipSizeStyle = useMemo(() => ({
		scale: tileClipSize,
	}), [tileClipSize]);
	// calculate size of tile clip (extra padding)
	// also adjusts transform origin for scale
	const tileClipPaddingStyle = useMemo(() => ({ 
		... (
			// if tile is not head or tail, don't extend clip box
			!(tile.isHead || tile.isTail)? { padding: 0, margin: 0 }
			: tile.directionIn[0] == 1? {
				paddingLeft: 100 / tileClipSize + '%', 
				marginLeft: -100 / tileClipSize + '%',
				transformOrigin: 100 * (0.5 + 1/tileClipSize) / (1 + 1/tileClipSize) + '%' + ' ' + 50 + '%'
			}: tile.directionIn[0] == -1? {
				paddingRight: 100 / tileClipSize + '%',
				transformOrigin: 100 * 0.5 / (1 + 1/tileClipSize) + '%' + ' ' + 50 + '%'
			}: tile.directionIn[1] == 1? {
				paddingTop: 100 / tileClipSize + '%', 
				marginTop: -100 / tileClipSize + '%',
				transformOrigin: 50 + '%' + ' ' + 100 * (0.5 + 1/tileClipSize) / (1 + 1/tileClipSize) + '%'
			}: tile.directionIn[1] == -1? {
				paddingBottom: 100 / tileClipSize + '%',
				transformOrigin: 50 + '%' + ' ' + 100 * 0.5 / (1 + 1/tileClipSize) + '%'
			}: { padding: 0, margin: 0 }
		)
	}), [tileSize, tile, tileClipSize]);
	// get initial borderradius of tile clip
	const tileClipInitialBorderRadiusStyle = useMemo(() => {
		// if tile is head, get border radius of old head tile
		if (tile.isHead) {
			if (previousSnakeTile) return {
				borderRadius: previousSnakeTile.borderRadius.map(x => x/100*tileSize + 'px').join(' ')
			}
		}
		// otherwise, initial clipping border radius is 0
		return { borderRadius: 0 };
	}, [previousSnakeTile, tile, tileSize]);
	// returns initial state of tile clip before animations
	const tileClipInitialStyle = useMemo(() => ({
		transition: 'none',
		...tileClipSizeStyle,
		...tileClipPaddingStyle,
		...tileClipInitialBorderRadiusStyle
	}), [tileClipSizeStyle, tileClipPaddingStyle, tileClipInitialBorderRadiusStyle]);

	// these styles are the styles before any animations
	const getTileStyle = useCallback((tile) => ({
		transition: 'none',
		backgroundColor: tile.color?? 'transparent',
		borderRadius: tile.borderRadius?.map(x => x/100*tileSize + 'px').join(' '),
		... (
			(!tile.animated && (tile.isHead || tile.isTail))?
			{ transform: 'translate(' + -tile.directionIn[0] * 100 / tileClipSize + '%, ' 
				+ -tile.directionIn[1] * 100 / tileClipSize + '%) '
				+ 'scale(' + (tile.size?? 1) / tileClipSize + ')' }
			: { transform: 'scale(' + (tile.size?? 1) / tileClipSize + ')' }
		)
	}), [tileSize, tileClipSize]);
	const getOldTileStyle = useCallback((oldTile, currentTile) => ({
		... getTileStyle(oldTile),
		... (
			(!currentTile.animated && (currentTile.isHead || currentTile.isTail))?
			{ transform: 'translate(' + -currentTile.directionIn[0] * 100 / tileClipSize + '%, ' 
				+ -currentTile.directionIn[1] * 100 / tileClipSize + '%)' 
				+ ' scale(' + (oldTile.size?? 1) / tileClipSize + ')'}
			: {} // NOTE: we don't need to override transform b/c value set in getTileStyle will be used
		)
	}), [getTileStyle, tileClipSize]);

	// returns the initial state of tile before animations
	const initialTileStyle = useMemo(() => {
		if (tile.animated) return getTileStyle(tile);
		if (tile.isHead) return getTileStyle(tile);
		if (tile.oldTile.type && tile.isTail) {
			// get style of old tail
			return getOldTileStyle(previousSnakeTile, tile);
		}
		// otherwise, just return old tile style if it exists
		if (tile.oldTile.type) return getOldTileStyle(tile.oldTile, tile);
		// if old tile doesn't exist, then just return tile style
		return getTileStyle(tile);
	}, [tile, previousSnakeTile, getTileStyle, getOldTileStyle]);

	// start necessary transitions, when tile has changed
	const tileElement = useRef(null);
	const tileElementClip = useRef(null);
	const oldTileElement = useRef(null);

	// run following before render:
	useMemo(() => {
		// basically, if the elements already exist, then just set html again
		if (tileElement.current) Object.assign(tileElement.current.style, initialTileStyle);
		if (tileElementClip.current) Object.assign(tileElementClip.current.style, tileClipInitialStyle);
	}, [initialTileStyle, tileClipInitialStyle]);
	// store all animations in a ref
	const animations = useRef([]);
	// run following after render:
	useEffect(() => {
		if (tile.animated) return;

		// reset animations
		// NOTE: old animations should be handled by remove function of this effect
		animations.current = [];

		// note for all animations:
		// style is set to the final state before animation, so that fill: 'backwards' can be used
		// this needs to be done so it can be overriden later (for some reason you can't override fill: 'forwards')

		// animate old tile to new if new tile is tail
		if (tile.isTail) {
			// animate new tile
			Object.assign(tileElement.current.style, {... getTileStyle(tile), 
				transform: 'translate(0, 0) scale(' + (tile.size?? 1) / tileClipSize + ')'});
			animations.current.push(tileElement.current.animate([
				initialTileStyle,
				{
					... getTileStyle(tile),
					transform: 'translate(0, 0) scale(' + (tile.size?? 1) / tileClipSize + ')'
				}
			], {
				duration: travelSpeed * 1000,
				easing: 'linear',
				fill: 'backwards'
			}));

			// animate oldTile border radius to the tail's
			if (tile.oldTile?.type) {
				Object.assign(oldTileElement.current.style, { 
					borderRadius: tile.borderRadius.map(x => x/100*tileSize + 'px').join(' ') 
				});
				animations.current.push(oldTileElement.current.animate([
					{ borderRadius: (tile.oldTile?.borderRadius?? [0, 0, 0, 0]).map(x => x/100*tileSize + 'px').join(' ') },
					{ borderRadius: tile.borderRadius.map(x => x/100*tileSize + 'px').join(' ') }
				], {
					duration: travelSpeed * 1000,
					easing: 'linear',
					fill: 'backwards'
				}));
			}
		}
		// if tile is a head, animate it in, and animate tile clip properly
		else if (tile.isHead) {
			// animate transform and also width or height, depending on direction
			Object.assign(tileElement.current.style, { 
				transform: 'translate(0, 0) scale(' + (tile.size?? 1) / tileClipSize + ')'
			});
			animations.current.push(tileElement.current.animate([
				{
					transform: 'translate(' + -tile.directionIn[0] * 100 / tileClipSize + '%, ' 
						+ -tile.directionIn[1] * 100 / tileClipSize + '%) '
						+ 'scale(' + (previousSnakeTile.size?? 1) / tileClipSize + ')'
				},
				{ transform: 'translate(0, 0) scale(' + (tile.size?? 1) / tileClipSize + ')'}
			], {
				duration: travelSpeed * 1000,
				easing: 'ease',
				fill: 'backwards'
			}));

			// current tile at the oldHead position
			const oldHead = currentTileAtPreviousPos;
			if (oldHead) {
				// animate tile clipping to mimic oldHead tile's border radius animation
				Object.assign(tileElementClip.current.style, {
					borderRadius: oldHead.borderRadius.map(x => x/100*tileSize + 'px').join(' ')
				});
				animations.current.push(tileElementClip.current.animate([
					tileClipInitialBorderRadiusStyle,
					{ borderRadius: oldHead.borderRadius.map(x => x/100*tileSize + 'px').join(' ') }
				], {
					duration: travelSpeed * 1000,
					easing: 'ease',
					fill: 'backwards'
				}));
			}

			// if oldTileElement exists, then animate it to shrink to head position (it's being eaten)
			if (oldTileElement.current) {
				Object.assign(oldTileElement.current.style, {
					transform: 'scale(0)', 
					transformOrigin: (50 + (-tile.directionIn[0] * 50)) + '%' + 
								' ' + (50 + (-tile.directionIn[1] * 50)) + '%'
				});
				animations.current.push(oldTileElement.current.animate([
					{ transform: 'scale(' + (tile.oldTile.size ?? 1) / tileClipSize + ')' },
					{ 
						transform: 'scale(0)', 
						transformOrigin: (50 + (-tile.directionIn[0] * 50)) + '%' + 
									' ' + (50 + (-tile.directionIn[1] * 50)) + '%'
					}
				], {
					duration: travelSpeed * 1000,
					easing: 'ease',
					fill: 'backwards'
				}));
			}
		}
		// otherwise, just animate from old tile to new tile
		else if (tile.oldTile.type) {
			Object.assign(tileElement.current.style, getTileStyle(tile));
			animations.current.push(tileElement.current.animate([
				getOldTileStyle(tile.oldTile, tile),
				getTileStyle(tile)
			], {
				duration: travelSpeed * 1000,
				easing: 'ease',
				fill: 'both'
			}));
		}

		// when we've finished animating, set animated to true
		for (const animation of animations.current)	
			animation.onfinish = () => tile.animated = true;
		
		// every quarter of the way through all animations, 
		// adjust them so they will finish at the correct time
		const intervals = animations.current.map((animation) => {
			const currentTime = performance.now();
			return setInterval(() => {
				tile.animated = true; // once we get to the intervals, we assume tile will be animated
				const timeRemaining = travelSpeed * 1000 - (performance.now() - currentTime);
				const newPlaybackRate = (travelSpeed * 1000 - animation.currentTime) / timeRemaining;
				if (newPlaybackRate > 0 && newPlaybackRate < Infinity) animation.playbackRate = newPlaybackRate;
			}, travelSpeed * 1000 / 4);
		});

		// when new tile is starting to be rendered, force finish all animations
		// also cancel intervals
		return () => {
			for (const animation of animations.current) {
				if (animation.pending) {
					// sometimes, the duration is infinite for some reason, so we need to set it to 1
					animation.effect.updateTiming({ duration: 1 });
					animation.finish();
				}
			}
			for (const interval of intervals) clearInterval(interval);
		};
	}, [tile, previousSnakeTile, getOldTileStyle, getTileStyle, initialTileStyle, 
		tileClipInitialBorderRadiusStyle, tileSize, travelSpeed]);

	return (
		<div id={tileID} style={getTileContainerStyle(tile)} className={style['tile-container']}>
			{/* Keep showing old tile if the head moved into something, or if the tail is moving in */}
			{ (!tile.animated && ((tile.oldTile.type && tile.isTail) || tile.isHead))?
				<div className={style['tile-clip']} id="old-tile"
					style={tileClipSizeStyle}>
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
