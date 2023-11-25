import io from 'socket.io-client';

import KeybindManager from './Keybind-Manager.js'
import { Tile } from '../../../server-logic/classes/Tile.js';

class Client extends KeybindManager {
	// controls is a map of key names to sets of actions
	constructor(controls) {
		super(controls);

		this.socket = io();
		this.initializeSocket();

		this.boardState;
		this.headPos;

		this.alive = false; // don't update direction if dead
		this.direction = [0, 0]; // direction of snake, stored so we don't spam the server
		
		// add listeners for this client's events
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
				this.headPos = headPos;
			}

			this.emit("gameUpdate", this.boardState, this.headPos, this.olderHeadPos);
		});

		this.socket.on("abilityUpgrade", (options, isUpgrade) => {
			this.emit("abilityUpgrade", options, isUpgrade);
		});

		this.socket.on("death", (data) => {
			this.alive = false;

			this.emit("death", data);
			// also get rid of ability upgrade popup
			this.emit("abilityUpgrade", null);
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

		this.on("activateAbility", () => {
			this.socket.emit("activateAbility", (headPos, direction) => {
				this.headPos = headPos ?? this.headPos;
				this.direction = direction ?? this.direction;
	
				this.emit("gameUpdate", null, this.headPos);
			});
		});
	}

	// sends message to server to upgrade ability
	upgradeAbility(abilityName) {
		this.socket.emit("upgradeAbility", abilityName, (newOptions, isUpgrade) => {
			// NOTE: newOptions may be null
			this.emit("abilityUpgrade", newOptions, isUpgrade);
		});
	}

	setName(name) { this.name = name; }
	setColor(color) { this.color = color; }
	// if called before connect, will be called when connected
	joinGame() {
		// either call function, or add listener for connect
		if (this.connected) this.joinGameFunction();
		else {
			this.emit("loadingStatus", "Connecting");
			this.once("connect", () => this.joinGameFunction());
		}
	}
	joinGameFunction() {
		this.emit("loadingStatus", "Joining");
		// send name to server
		this.socket.emit("join", this.name, this.color, (dimensions, tiles, headPos) => {
			this.emit("loadingStatus", "Loading");

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
	// generates board based on dimensions and tiles when joining game
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

	// applies tile changes to board state
	updateBoard(tileChanges) {
		for (const tile of tileChanges) {
			const [x, y] = tile.position;
			this.boardState[y][x] = tile;
		}
	}
}

export default Client;