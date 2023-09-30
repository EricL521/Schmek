import io from 'socket.io-client';

const initializeSocket = () => {
	const socket = io();

	return socket;
};

export default initializeSocket;