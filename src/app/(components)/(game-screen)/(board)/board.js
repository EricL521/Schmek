// component that renders the board

import { useEffect, useMemo, useRef, useState } from "react";

import style from "./board.module.css";

import BoardTile from "./board-tile";

// contains logic for getting and rendering board from client
export default function Board({ client, tileSize }) {
	// add listeners for boardstate and headpos to client
	useEffect(() => {
		// add listener for when board is updated or initialized
		const gameUpdateListener = (boardState, headPos, oldHeadPos) => {
			if (boardState) setBoardState([... boardState]);
			if (headPos) setHeadPos([... headPos]);
			if (oldHeadPos) setOldHeadPos([... oldHeadPos]);
		};
		client.on("gameUpdate", gameUpdateListener);
		client.on("initialState", gameUpdateListener);

		// return function to remove listeners
		return () => {
			client.removeListener("gameUpdate", gameUpdateListener);
			client.removeListener("initialState", gameUpdateListener);
		};
	}, [client]);
	// initialize board state and head position to client's
	const [boardState, setBoardState] = useState(client?.boardState);
	const [headPos, setHeadPos] = useState(client?.headPos);
	const [oldHeadPos, setOldHeadPos] = useState(client?.oldHeadPos);

	// add listeners for travelSpeed
	useEffect(() => {
		const travelSpeedListener = travelSpeed => setTravelSpeed(travelSpeed);
		client.on("travelSpeed", travelSpeedListener);
		// remove listener on remount
		return () => client.removeListener("travelSpeed", travelSpeedListener);
	}, [client]);
	const [travelSpeed, setTravelSpeed] = useState(client?.travelSpeed);
	// also calculate transition duration
	const boardTransitionDuration = useMemo(() => ({
		transitionDuration: 2 * travelSpeed + 's'
	}), [travelSpeed]);

	const boardElement = useRef(null);

	// save previous tileSize, so we can change tile size with NO transition
	const previousTileSize = useRef(tileSize);
	useEffect(() => { previousTileSize.current = tileSize; }, [tileSize]); // NOTE: this runs after everything else
	// style for width and height of board
	const boardSizeStyle = useMemo(() => ({
		width: boardState[0].length * tileSize + 'px',
		height: boardState.length * tileSize + 'px',
	}), [boardState, tileSize]);
	const boardTransitionPropertyStyle = tileSize == previousTileSize.current? {} : {transitionProperty: 'none'};
	// offset board to make headPos the center, NOTE: offset from cropping the board is done seperately
	const boardPosStyle = useMemo(() => ({
		left: -1 * (headPos[0] + 0.5 + 0.25 * (headPos[0] - oldHeadPos[0])) * tileSize + 'px',
		top: -1 * (headPos[1] + 0.5 + 0.25 * (headPos[1] - oldHeadPos[1])) * tileSize + 'px',
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
	const croppedBoardState = useMemo(() => {
		// get tileSize in pixels
		const tileSizePx = tileSize;
		// get number of tiles that fit on the screen left and right and up and down of head
		const tilesX = Math.ceil(windowSize[0] / tileSizePx / 2) + 1;
		const tilesY = Math.ceil(windowSize[1] / tileSizePx / 2) + 1;

		// get current position of table, or use headPos if table is not rendered yet
		let currentHeadPos = headPos;
		if (boardElement.current) {
			const boardRect = boardElement.current.getBoundingClientRect();
			// convert to tile coordinates
			currentHeadPos = [
				Math.round((windowSize[0]/2 - boardRect.left) / tileSizePx),
				Math.round((windowSize[1]/2 - boardRect.top) / tileSizePx)
			];
		}

		// min and max y-index to be rendered
		const minY = Math.max(0, Math.min(headPos[1] - tilesY, currentHeadPos[1] - tilesY));
		const maxY = Math.min(boardState.length - 1, Math.max(headPos[1] + tilesY, currentHeadPos[1] + tilesY));
		// min and max x-index to be rendered
		const minX = Math.max(0, Math.min(headPos[0] - tilesX, currentHeadPos[0] - tilesX));
		const maxX = Math.min(boardState[0].length - 1, Math.max(headPos[0] + tilesX, currentHeadPos[0] + tilesX));

		// crop y, then x
		const croppedBoardState = boardState.slice(minY, maxY + 1)
			.map(row => row.slice(minX, maxX + 1));

		return croppedBoardState;
	}, [boardState, headPos, boardElement, tileSize, windowSize]);
	
	// generate table
	const getTileKey = (tile) => tile.position.join(',') + ' ' + Math.random(); // temporary fix to force new elements
	// NOTE: forcing new elements might be a permanent thing; only a few tiles would actually be reused
	// and it results in buggy behavior with tiles reverting to the oldTile for some reason
	// this is because tile.animated isn't set until the animation finishes, which runs after 
	// the initial tile is set, but before the useEffect animation, which means it gets stuck on the oldTile
	// without animating to the new one, but only sometimes
	const rows = useMemo(() => croppedBoardState.map((row) =>
		row.map(tile => tile.type &&
			<BoardTile key={getTileKey(tile)} tileID={getTileKey(tile)} 
				board={boardState} tile={tile} tileSize={tileSize} travelSpeed={travelSpeed} />
		)
	), [croppedBoardState, tileSize, travelSpeed]);

	return (
		<div style={{...boardTransitionDuration, ...boardTransitionPropertyStyle, ...boardPosStyle, ...boardSizeStyle, ...boardBorderStyle}} id={style['board']} ref={boardElement}>
			{rows}
		</div>
	);
};
