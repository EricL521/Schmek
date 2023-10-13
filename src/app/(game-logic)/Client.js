import io from 'socket.io-client';
import { EventEmitter } from 'events';

class Client extends EventEmitter {
	constructor() {
		super();

		this.socket = io();
		this.initializeSocket();

		this.boardState;
		this.headPos;
	}
	get connected() { return this.socket.connected; }
	disconnect() { this.socket.disconnect(); }

	// add listeners for socket events
	initializeSocket() {
		this.socket.on("gameUpdate", (tileChanges, headPos) => {
			this.updateBoard(tileChanges);
			this.headPos = headPos;

			this.emit("gameUpdate", this.boardState, this.headPos);
		});
	}

	// if called before connect, will be called when connected
	joinGame(name) {
		// make another function so we can reuse the code below
		const joinGameFunction = () => {
			// send name to server
			this.socket.emit("join", name, (boardState, headPos) => {
				// in call back initialize board
				this.boardState = boardState;
				this.headPos = headPos;

				this.emit("boardState", boardState, headPos);
				this.emit("boardInitialized");
			});
		};

		// either call function, or add listener for connect
		if (this.connected) joinGameFunction();
		else this.once("connect", joinGameFunction.bind(this));
	}

	// applies tile changes to board state
	updateBoard(tileChanges) {
		for (const tileChange of tileChanges) {
			const [x, y] = tileChange.position;
			this.boardState[y][x] = tileChange.color;
		}
	}
}

export default Client;