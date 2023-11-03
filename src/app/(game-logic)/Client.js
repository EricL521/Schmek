import io from 'socket.io-client';
import { EventEmitter } from 'events';

import { Tile } from '../../../server-logic/classes/Tile';

class Client extends EventEmitter {
	// map of actions to argument arrays, where first element is the name of the event
	static get actions() {return new Map([
		["moveUp", ["direction", [0, -1]]],
		["moveDown", ["direction", [0, 1]]],
		["moveLeft", ["direction", [-1, 0]]],
		["moveRight", ["direction", [1, 0]]],
		["reverseSnake", ["reverseSnake"]]
	]);}
	// maps key names to actions
	static get defaultControls() {return new Map([
		["ArrowUp", new Set(["moveUp"])],
		["ArrowDown", new Set(["moveDown"])],
		["ArrowLeft", new Set(["moveLeft"])],
		["ArrowRight", new Set(["moveRight"])],
		["w", new Set(["moveUp"])],
		["s", new Set(["moveDown"])],
		["a", new Set(["moveLeft"])],
		["d", new Set(["moveRight"])],
		[" ", new Set(["reverseSnake"])]
	]);}
	// also make the above non-static
	get actions() {return Client.actions;}
	get defaultControls() {return Client.defaultControls;}

	constructor(controls) {
		super();

		if (controls) {
			this.controls = controls;
			this.controlsArray = this.genControlsArray();
		}
		else {
			// check local storage for controls
			const storedControlsArray = localStorage.getItem('controlsArray');
			if (storedControlsArray) {
				this.controlsArray = JSON.parse(storedControlsArray);
				this.controls = this.genControlsMap(); 
			}
			else {
				this.controls = Client.defaultControls;
				this.controlsArray = this.genControlsArray();
			}
		}

		this.socket = io();
		this.initializeSocket();

		this.boardState;
		this.olderHeadPos;
		this.oldHeadPos;
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
			if (headPos) {
				this.olderHeadPos = this.oldHeadPos;
				this.oldHeadPos = this.headPos;
				this.headPos = headPos;
			}

			this.emit("gameUpdate", this.boardState, this.headPos, this.olderHeadPos);
		});

		this.socket.on("death", (data) => {
			this.alive = false;

			this.emit("death", data);
		});
	}
	// adds listeners for this client's events
	initializeClient() {
		// save controls to local storage when they change
		this.on('controlsChange', () => localStorage.setItem('controlsArray', JSON.stringify(this.controlsArray)));

		this.on("direction", ([x, y]) => {
			// if that direction is already set or snake is dead, don't send it
			if (!this.alive || (this.direction[0] == x && this.direction[1] == y) ) return;
			
			this.socket.emit("direction", [x, y], ([x, y]) => {
				this.direction = [x, y]; // callback to make sure server got it
			});
		});

		this.on("reverseSnake", () => {
			this.socket.emit("reverseSnake", (headPos, direction) => {
				this.headPos = headPos;
				this.direction = direction;
	
				this.emit("gameUpdate", null, this.headPos);
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
		this.socket.emit("join", name, color, (dimensions, tiles, headPos) => {
			// snake is now alive, also reset direction
			this.alive = true;
			this.direction = [0, 0];

			// initialize board state and head position
			this.boardState = this.genBoard(dimensions, tiles);
			this.oldHeadPos = headPos;
			this.headPos = headPos;

			this.emit("initialState", this.boardState, this.headPos);
			this.emit("boardInitialized");
		});
	} 
	genBoard(dimensions, tiles) {
		const boardState = [];
		for (let y = 0; y < dimensions[1]; y++) {
			const row = [];
			for (let x = 0; x < dimensions[0]; x++) {
				row.push(new Tile([x, y]));
			}
			boardState.push(row);
		}
		for (const tile of tiles) {
			const [x, y] = tile.position;
			boardState[y][x] = tile;
		}
		
		return boardState;
	}

	genControlsArray() {
		const controlsArray = [];
		for (const [key, actions] of this.controls) {
			for (const action of actions) {
				controlsArray.push([key, action]);
			}
		}
		return controlsArray;
	}
	genControlsMap() {
		const controls = new Map();
		for (const [key, action] of this.controlsArray) {
			const actions = controls.get(key);
			if (actions) actions.add(action);
			else controls.set(key, new Set([action]));
		}
		return controls;
	}
	setKeybind(index, key, action) {
		// remove old action from controls
		const oldKey = this.controlsArray[index][0];
		const oldAction = this.controlsArray[index][1];
		if (oldKey == key && oldAction == action) return; // don't do anything if keybind is the same
		const oldActions = this.controls.get(oldKey);
		if (oldActions) {
			oldActions.delete(oldAction);
			if (oldKey !== key && oldActions.size == 0) this.controls.delete(oldKey);
		}

		// update controlsArray and controls
		const actions = this.controls.get(key);
		// if action already is there, set action to "" instead
		if (actions && actions.has(action)) action = "";
		if (actions) actions.add(action);
		else this.controls.set(key, new Set([action]));
		this.controlsArray[index] = [key, action];
		
		// emit event to update local storage
		this.emit("controlsChange");
	}
	addKeybind(key, action) {
		// update controlsArray and controls
		const actions = this.controls.get(key);
		if (actions) actions.add(action);
		else this.controls.set(key, new Set([action]));
		this.controlsArray.unshift([key, action]);
		
		// emit event to update local storage
		this.emit("controlsChange");
	}
	removeKeybind(index) {
		// remove action from controls
		const key = this.controlsArray[index][0];
		const action = this.controlsArray[index][1];
		const actions = this.controls.get(key);
		if (actions) {
			actions.delete(action);
			if (actions.size == 0) this.controls.delete(key);
		}

		// update controlsArray
		this.controlsArray.splice(index, 1);

		// emit event to update local storage
		this.emit("controlsChange");
	}
	sortKeybinds() {
		// genControlsArray is already sorted
		this.controlsArray = this.genControlsArray();
	}
	// overrides all keybinds with default keybinds
	resetKeybinds() {
		// reset controls and controlsArray
		this.controls = Client.defaultControls;
		this.controlsArray = this.genControlsArray();

		// emit event to update local storage
		this.emit("controlsChange");
	}
	// called when user presses a key, and emits necessary events
	keyPress(key) {
		const actions = this.controls.get(key);
		if (!actions) return;

		for (const action of actions) {
			const directions = Client.actions.get(action);
			if (directions) this.emit(directions[0], ...directions.slice(1));
		}
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