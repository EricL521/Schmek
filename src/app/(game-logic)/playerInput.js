'use client'
import {useEffect} from 'react';
import initializeSocket from './socket.js';

export default function PlayerInput() {
	// useEffect runs after EVERY render, but PlayerInput should only run once
	useEffect(() => {
		const socket = initializeSocket();
		// onDisconnect:
		return () => {
			socket.disconnect();
		};
	});

	return;
};