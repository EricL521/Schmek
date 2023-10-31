// component that renders the board

import { useEffect, useMemo, useState } from "react";

import style from "./board.module.css";

import BoardRow from "./board-row";

// boardstate is a 2d array of tiles{position[2], color}
// headpos is just [x, y]
export default function Board({ boardState, headPos, tileSize }) {
	// offset board to make headPos the center
	const boardStyle = useMemo(() => ({
		left: 'calc( 50% - ' + (headPos[0] + 0.5) * tileSize + 'vh )',
		top: 'calc( 50% - ' + (headPos[1] + 0.5) * tileSize + 'vh )',
		boxShadow: '0 0 ' + 5*tileSize + 'vh ' + 5*tileSize + 'vh var(--secondary-color)',
	}), [headPos, tileSize]);

	// create listener for window resize
	const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);
	useEffect(() => {
		const resizeListener = () => {
			setWindowSize([window.innerWidth, window.innerHeight]);
		};
		window.addEventListener('resize', resizeListener);

		return () => window.removeEventListener('resize', resizeListener);
	}, []);
	// crop boardstate to only include tiles that are on screen
	// also get style for offsetting board b/c tiles we cropped off
	const [croppedBoardState, boardCropOffset] = useMemo(() => {
		// get tileSize in pixels
		const tileSizePx = tileSize * windowSize[1] / 100;
		// get number of tiles that fit on the screen left and right and up and down of head
		const tilesX = 1 + Math.ceil(windowSize[0] / tileSizePx / 2);
		const tilesY = 1 + Math.ceil(windowSize[1] / tileSizePx / 2);

		// crop y, then x
		const croppedBoardState = boardState.slice(Math.max(0, headPos[1] - tilesY), headPos[1] + tilesY + 1)
			.map(row => row.slice(Math.max(0, headPos[0] - tilesX), headPos[0] + tilesX + 1));
		// get offset for board
		const boardCropOffset = {
			marginLeft: Math.max(0, headPos[0] - tilesX) * tileSize + 'vh',
			marginTop: Math.max(0, headPos[1] - tilesY) * tileSize + 'vh',
			marginRight: Math.max(0, boardState[0].length - (headPos[0] + tilesX)) * tileSize + 'vh',
			marginBottom: Math.max(0, boardState.length - (headPos[1] + tilesY)) * tileSize + 'vh',
		};

		return [croppedBoardState, boardCropOffset];
	}, [boardState, headPos, tileSize, windowSize]);
	
	// generate table
	const rows = useMemo(() => croppedBoardState.map((row, index) =>
		<BoardRow key={index} row={row} tileSize={tileSize} />
	), [croppedBoardState, tileSize]);
	return (
		<div style={boardStyle} id={style['board']}>
			<div style={boardCropOffset} id={style['board-offset']}>
				{rows}
			</div>
		</div>
	);
};