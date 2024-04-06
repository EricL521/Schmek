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
		this.olderHeadPos;
		this.oldHeadPos;
		this.headPos;
		this.travelSpeed = 0; // seconds per box traveled of snake

		this.cooldown = 0; // cooldown in seconds of ability
		this.lastAbilityUse = new Date(0); // time of last ability use
		this.abilityUpgrades; // possible ability upgrade paths

		this.alive = false; // don't update direction if dead
		this.direction = [0, 0]; // direction of snake, stored so we don't spam the server
		
		// add listeners for this client's events
		this.initializeClient();
	}
	get connected() { return this.socket.connected; }
	disconnect() { this.socket.disconnect(); }

	// add listeners for socket events
	initializeSocket() {
		this.socket.on("gameUpdate", (tileChanges, headPos, travelTPS) => {
			// update board state & head position
			this.updateBoard(tileChanges);
			const headPosChanged = headPos && (this.headPos[0] !== headPos[0] || this.headPos[1] !== headPos[1]);
			if (headPosChanged) {
				this.olderHeadPos = this.oldHeadPos;
				this.oldHeadPos = this.headPos;
				this.headPos = headPos?? this.headPos;
			}

			// update and emit travelSpeed
			const travelSpeed = 1 / travelTPS;
			if (!isNaN(travelSpeed)) {
				const oldTravelSpeed = this.travelSpeed;
				this.travelSpeed = travelSpeed;
				if (oldTravelSpeed !== travelSpeed)
					this.emit("travelSpeed", this.travelSpeed);
			}

			// only emit gameUpdate if something changed
			if (tileChanges.length || headPosChanged)
				this.emit("gameUpdate", this.boardState, this.headPos, this.oldHeadPos, this.olderHeadPos);
		});

		this.socket.on("abilityUpgrade", (newOptions, isUpgrade, newCooldown) => {
			this.cooldown = newCooldown?? this.cooldown; // update cooldown
			this.abilityUpgrades = newOptions; // update ability upgrades
			this.emit("abilityUpgrade", this.abilityUpgrades, isUpgrade, this.cooldown);
		});

		this.socket.on("death", (data) => {
			this.alive = false;

			this.emit("death", data);
			// also get rid of ability upgrade popup and cooldown
			this.cooldown = 0;
			this.emit("abilityUpgrade", null, false, this.cooldown);
			this.lastAbilityUse = new Date(0);
			this.emit("abilityActivated", this.lastAbilityUse);
		});
	}
	// sends message to server to upgrade ability
	upgradeAbility(abilityName) {
		this.socket.emit("upgradeAbility", abilityName, (newOptions, isUpgrade, newCooldown) => {
			this.cooldown = newCooldown?? this.cooldown; // update cooldown
			this.abilityUpgrades = newOptions; // update ability upgrades
			// NOTE: newOptions may be null
			this.emit("abilityUpgrade", newOptions, isUpgrade, this.cooldown);
		});
	}
	// adds listeners for this client's events
	// these are for keybinds
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
			// check if cooldown is over, if so don't activate ability
			const timeSinceLastAbilityUse = Date.now() - this.lastAbilityUse;
			if (timeSinceLastAbilityUse < this.cooldown * 1000) return;

			this.socket.emit("activateAbility", (headPos, direction) => {
				this.headPos = headPos ?? this.headPos;
				this.direction = direction ?? this.direction;
				// callback is only called if ability is activated, so set last ability use to now
				this.lastAbilityUse = new Date(); 
				this.emit("abilityActivated", this.lastAbilityUse, this.cooldown);
	
				this.emit("gameUpdate", null, this.headPos);
			});
		});

		this.on("upgradeAbility", (index) => {
			if (!this.abilityUpgrades) return; // can only upgrade if upgrades are available
			
			const abilityName = this.abilityUpgrades[index];
			if (abilityName) this.upgradeAbility(abilityName);
		});

		this.on("togglePauseGame", () => this.socket.emit("togglePauseGame"));
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
		this.socket.emit("join", this.name, this.color, (dimensions, tiles, headPos, serverTPS) => {
			this.emit("loadingStatus", "Loading");

			// snake is now alive, also reset direction
			this.alive = true;
			this.direction = [0, 0];

			// set and emit travelSpeed
			this.travelSpeed = 1 / serverTPS;
			this.emit("travelSpeed", this.travelSpeed);

			// initialize board state and head position
			this.genBoard(dimensions, tiles);
			this.olderHeadPos = headPos;
			this.oldHeadPos = headPos;
			this.headPos = headPos;

			this.emit("initialState", this.boardState, this.headPos, this.oldHeadPos, this.olderHeadPos);
			this.emit("boardInitialized");
		});
	} 
	// generates board based on dimensions and tiles when joining game
	genBoard(dimensions, tiles) {
		this.boardState = [];
		for (let y = 0; y < dimensions[1]; y++) {
			const row = [];
			for (let x = 0; x < dimensions[0]; x++) {
				row.push(new Tile([x, y]));
			}
			this.boardState.push(row);
		}
		this.updateBoard(tiles);
	}

	// applies tile changes to board state
	// NOTE: also stores oldTile to tile.oldTile
	updateBoard(tileChanges) {
		for (const tile of tileChanges) {
			const [x, y] = tile.position;
			tile.oldTile = this.boardState[y][x];
			tile.animated = false;
			this.boardState[y][x] = tile;
		}
	}
}

export default Client;