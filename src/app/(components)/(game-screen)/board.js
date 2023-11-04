// component that renders the board

import { useEffect, useMemo, useRef, useState } from "react";

import style from "./board.module.css";

import BoardRow from "./board-row";

// boardstate is a 2d array of tiles{position[2], color}
// headpos is just [x, y]
export default function Board({ boardState, oldHeadPos, headPos, tileSize }) {
	// save previous tileSize, so we can change tile size with NO transition
	const previousTileSize = useRef(tileSize);
	useEffect(() => { previousTileSize.current = tileSize; }, [tileSize]);
	const boardTransition = tileSize == previousTileSize.current? {} : {transition: 'none'};
	// offset board to make headPos the center
	const boardPosStyle = useMemo(() => ({
		left: -1 * (headPos[0] + 0.5) * tileSize + 'px',
		top: -1 * (headPos[1] + 0.5) * tileSize + 'px',
	}), [headPos, tileSize]);
	const boardBorderStyle = useMemo(() => ({
		boxShadow: '0 0 ' + 5*tileSize + 'px ' + 5*tileSize + 'px var(--secondary-color)',
	}), [tileSize]);

	// create listener for window resize
	const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
	useEffect(() => {
		const resizeListener = () => {
			setWindowSize([window.innerWidth, window.innerHeight]);
		};
		window.addEventListener('resize', resizeListener);

		return () => window.removeEventListener('resize', resizeListener);
	}, []);
	// crop boardstate to only include tiles that are on screen, when moving between oldHeadPos and headPos
	// also get style for offsetting board b/c tiles we cropped off
	const [croppedBoardState, boardCropOffset] = useMemo(() => {
		// get tileSize in pixels
		const tileSizePx = tileSize;
		// get number of tiles that fit on the screen left and right and up and down of head
		const tilesX = Math.ceil(windowSize[0] / tileSizePx / 2);
		const tilesY = Math.ceil(windowSize[1] / tileSizePx / 2);

		// min and max y-index to be rendered
		const minY = Math.max(0, Math.min(headPos[1] - tilesY, oldHeadPos[1] - tilesY));
		const maxY = Math.min(boardState.length - 1, Math.max(headPos[1] + tilesY, oldHeadPos[1] + tilesY));
		// min and max x-index to be rendered
		const minX = Math.max(0, Math.min(headPos[0] - tilesX, oldHeadPos[0] - tilesX));
		const maxX = Math.min(boardState[0].length - 1, Math.max(headPos[0] + tilesX, oldHeadPos[0] + tilesX));

		// crop y, then x
		const croppedBoardState = boardState.slice(minY, maxY + 1)
			.map(row => row.slice(minX, maxX + 1));
		// get offset for board
		const boardCropPadding = {
			paddingLeft: minX * tileSize + 'px',
			paddingTop: minY * tileSize + 'px',
			paddingRight: (boardState[0].length - 1 - maxX) * tileSize + 'px',
			paddingBottom: (boardState.length - 1 - maxY) * tileSize + 'px',
		};

		return [croppedBoardState, boardCropPadding];
	}, [boardState, oldHeadPos, headPos, tileSize, windowSize]);
	
	// generate table
	const rows = useMemo(() => croppedBoardState.map((row, index) =>
		<BoardRow key={index} row={row} tileSize={tileSize} />
	), [croppedBoardState, tileSize]);
	return (
		<div style={{...boardTransition, ...boardPosStyle, ...boardCropOffset, ...boardBorderStyle}} id={style['board']}>
			{rows}
		</div>
	);
};