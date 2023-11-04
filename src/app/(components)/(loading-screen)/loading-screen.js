// screen displayed while connecting and loading from server
'use client';

import { useEffect, useRef, useState } from 'react';

import style from './loading-screen.module.css';
import LoadingText from './loading-text';

export default function LoadingScreen({ client, setPage }) {
	const [status, setStatus] = useState('Connecting');
	const joining = useRef(false);

	// add listeners to client
	useEffect(() => {
		// don't run if client is null or already joining
		if (!client || joining.current) return;

		// add loading status listener
		const loadingStatusListener = (status) => setStatus(status);
		client.on('loadingStatus', loadingStatusListener);
		// add listener for when board is initialized
		const boardInitializedListener = () => setPage('game-screen');
		client.once('boardInitialized', boardInitializedListener);
		// join game
		client.joinGame();
		// set joining to true
		joining.current = true;

		// do not remove listeners when component unmounts, because we only want to join once
	}, [client, setPage]);

	return (
		<div id={style['loading-screen']}>
			<LoadingText text={status}/>
		</div>
	);
}