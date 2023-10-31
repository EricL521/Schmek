// component that renders the board

import { useEffect, useMemo, useState } from "react";

import style from "./board.module.css";

import BoardRow from "./board-row";

// boardstate is a 2d array of tiles{position[2], color}
// headpos is just [x, y]
export default function Board({ boardState, oldHeadPos, headPos, tileSize }) {
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
	// crop boardstate to only include tiles that are on screen, when moving between oldHeadPos and headPos
	// also get style for offsetting board b/c tiles we cropped off
	const [croppedBoardState, boardCropOffset] = useMemo(() => {
		// get tileSize in pixels
		const tileSizePx = tileSize * windowSize[1] / 100;
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
		const boardCropOffset = {
			marginLeft: minX * tileSize + 'vh',
			marginTop: minY * tileSize + 'vh',
			marginRight: (boardState[0].length - 1 - maxX) * tileSize + 'vh',
			marginBottom: (boardState.length - 1 - maxY) * tileSize + 'vh',
		};

		return [croppedBoardState, boardCropOffset];
	}, [boardState, oldHeadPos, headPos, tileSize, windowSize]);
	
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