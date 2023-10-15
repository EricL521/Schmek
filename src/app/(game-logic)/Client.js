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

		this.direction = [0, 0]; // direction of snake, stored so we don't spam the server
		this.initializeClient();
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
	// adds listeners for this client's events
	initializeClient() {
		this.on("direction", (x, y) => {
			// if direction is already set, don't send it again
			if (this.direction[0] == x && this.direction[1] == y) return;
			
			this.direction = [x, y];
			this.socket.emit("direction", x, y);
		});
	}

	// if called before connect, will be called when connected
	joinGame(name, color) {
		// make another function so we can reuse the code below
		const joinGameFunction = () => {
			// send name to server
			this.socket.emit("join", name, color, (boardState, headPos) => {
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
	// called when user presses a key, and emits necessary events
	keyPress(key) {
		const action = this.controls.get(key);
		if (action) this.emit(action[0], ...action.slice(1));
	}
}

export default Client;