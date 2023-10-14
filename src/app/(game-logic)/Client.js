import io from 'socket.io-client';
import { EventEmitter } from 'events';

// maps key names to what they do
// emits the first value, and passes the rest as arguments
const defaultControls = new Map([
	["ArrowUp", ["direction", [0, -1]]],
	["ArrowDown", ["direction", [0, 1]]],
	["ArrowLeft", ["direction", [-1, 0]]],
	["ArrowRight", ["direction", [1, 0]]],
]);

class Client extends EventEmitter {
	constructor(controls) {
		super();

		this.controls = controls ?? defaultControls;

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
		for (const tile of tileChanges) {
			const [x, y] = tile.position;
			this.boardState[y][x] = tile;
		}
	}
	// called when user presses a key, and sends it to the server
	keyPress(key) {
		const action = this.controls.get(key);
		if (action) this.socket.emit(action[0], ...action.slice(1));
	}
}

export default Client;