import io from 'socket.io-client';
import { EventEmitter } from 'events';

class Client extends EventEmitter {
	constructor() {
		super();

		this.socket = io();
		this.initializeSocket();
	}
	get connected() { return this.socket.connected; }
	disconnect() { this.socket.disconnect(); }

	initializeSocket() {
		this.socket.once("connect", () => {
			this.emit("connect");
		});

		this.socket.once("disconnect", () => {
			this.emit("disconnect");
		});
	}

	// if called before connect, will be called when connected
	joinGame(name) {
		// make another function so we can reuse the code below
		const joinGameFunction = () => {
			// send name to server
			this.socket.emit("join", name, (boardState, headPos) => {
				// in call back initialize board
				this.emit("initializeBoard", boardState, headPos);
			});
		};

		// either call function, or add listener for connect
		if (this.connected) joinGameFunction();
		else this.once("connect", joinGameFunction.bind(this));
	}
}

export default Client;