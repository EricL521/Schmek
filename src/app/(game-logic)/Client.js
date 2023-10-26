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

		this.alive = false; // don't update direction if dead
		this.direction = [0, 0]; // direction of snake, stored so we don't spam the server
		this.initializeClient();
	}
	get connected() { return this.socket.connected; }
	disconnect() { this.socket.disconnect(); }

	// add listeners for socket events
	initializeSocket() {
		this.socket.on("gameUpdate", (tileChanges, headPos) => {
			// update board state & head position
			this.updateBoard(tileChanges);
			this.headPos = headPos;

			this.emit("gameUpdate", this.boardState, this.headPos);
		});

		this.socket.on("death", (data) => {
			this.alive = false;

			this.emit("death", data);
		});
	}
	// adds listeners for this client's events
	initializeClient() {
		this.on("direction", ([x, y]) => {
			// if that direction is already set or snake is dead, don't send it
			if (!this.alive || (this.direction[0] == x && this.direction[1] == y) ) return;
			
			this.socket.emit("direction", [x, y], ([x, y]) => {
				this.direction = [x, y]; // callback to make sure server got it
			});
		});
	}

	// if called before connect, will be called when connected
	joinGame(name, color) {
		this.name = name;
		this.color = color;

		// either call function, or add listener for connect
		if (this.connected) this.joinGameFunction(name, color);
		else this.once("connect", this.joinGameFunction.bind(this)(name, color));
	}
	// sends message to server to respawn
	respawn() {
		this.joinGameFunction(this.name, this.color);
	}
	joinGameFunction(name, color) {
		// send name to server
		this.socket.emit("join", name, color, (boardState, headPos) => {
			// snake is now alive, also reset direction
			this.alive = true;
			this.direction = [0, 0];

			// initialize board state and head position
			this.boardState = boardState;
			this.headPos = headPos;

			this.emit("boardState", boardState, headPos);
			this.emit("boardInitialized");
		});
	} 

	// called when user presses a key, and emits necessary events
	keyPress(key) {
		const action = this.controls.get(key);
		if (action) this.emit(action[0], ...action.slice(1));
	}

	// applies tile changes to board state
	updateBoard(tileChanges) {
		for (const tile of tileChanges) {
			const [x, y] = tile.position;
			this.boardState[y][x] = tile;
		}
	}
}

export default Client;