import io from 'socket.io-client';

import KeybindManager from './Keybind-Manager.js'
import { Tile } from '../../../server-logic/classes/Tile.js';
import AbilityManager from './Ability-Manager.js';

class Client extends KeybindManager {
	// controls is a map of key names to sets of actions
	constructor(controls) {
		super(controls);

		this.socket = io();
		this.initializeSocket();

		this.boardState;
		this.undergroundBoardState;

		this.olderHeadPos;
		this.oldHeadPos;
		this.headPos;
		this.travelSpeed = 0; // seconds per box traveled of snake

		this.abilities = new Map(); // abilityName -> AbilityManager
		this.abilitiesArray = []; // just a map of abilityNames
		this.numAvailableUpgrades = 0; // number of available upgrades
		this.abilityOptions; // possible ability upgrade paths

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
			this.updateBoard(this.boardState, this.undergroundBoardState, tileChanges);
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
				this.emit("gameUpdate", this.boardState, this.undergroundBoardState, this.headPos, this.oldHeadPos, this.olderHeadPos);
		});

		// NOTE: this.numAvailableUpgrades is upgraded in a listener
		this.socket.on("abilityUpgrade", (numAvailableUpgrades) => {
			this.emit("abilityUpgrade", numAvailableUpgrades);
		});

		this.socket.on("death", (data) => {
			this.alive = false;

			this.emit("death", data);
			// also get rid of abilities and force popups to update
			this.abilities = new Map();
			this.abilitiesArray = [];
			this.numAvailableUpgrades = 0;
			this.emit("abilityUpgrade", this.numAvailableUpgrades);
			this.emit("newAbility"); // causes ability-indicators to update
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

		this.on("activateAbility", (index) => {
			this.activateAbility(this.abilitiesArray[index]);
		});

		this.on("abilityUpgrade", (numAvailableUpgrades) => this.numAvailableUpgrades = numAvailableUpgrades);

		this.on("togglePauseGame", () => this.socket.emit("togglePauseGame"));
	}

	// note; this is called from ability-indicator component
	activateAbility(abilityName) {
		const ability = this.abilities.get(abilityName);
		ability?.activateAbility().then(([headPos, direction]) => {
			const headPosChanged = headPos && (this.headPos[0] !== headPos[0] || this.headPos[1] !== headPos[1]);
			if (headPosChanged) {
				this.olderHeadPos = this.oldHeadPos;
				this.oldHeadPos = this.headPos;
				this.headPos = headPos?? this.headPos;
			}

			this.direction = direction?? this.direction;
			this.emit("abilityActivated", ability);

			if (headPosChanged) this.emit("gameUpdate", null, null, this.headPos);
		}).catch(() => {}); // do nothing if rejected
	}
	// note: this is called from upgrade-ability-popup component
	// if it is a new ability, then abilityName and abilityUpgrade are the same
	// returns a promise that resolves to true if successful
	// or false if you already have the upgrade
	// otherwise rejects
	upgradeAbility(abilityName, abilityUpgrade) {
		if (this.numAvailableUpgrades <= 0) return Promise.reject(); // can only upgrade if upgrades are available
		if (!abilityName || !abilityUpgrade) return Promise.reject(); // and if both are defined

		// check if abilityName and abilityUpgrades are valid
		const ability = this.abilities.get(abilityName);
		if (abilityName != abilityUpgrade) {
			if (!ability) return Promise.resolve(false);
			// NOTE: hasUpgrade is if you already got the upgrade
			if (ability.hasUpgrade(abilityUpgrade)) return Promise.resolve(false);
		}
		if (ability && abilityName == abilityUpgrade) return Promise.resolve(false);
		
		return new Promise((res, _) => {
			if (ability)
				ability.upgradeAbility(abilityUpgrade).then((numAvailableUpgrades) => {
					this.emit("abilityUpgrade", numAvailableUpgrades, ability);
					res(true);
				}).catch(() => res(false));
			else {
				// if we don't have the ability yet, then create it
				const newAbility = new AbilityManager(abilityName, 0, this.socket);
				newAbility.upgradeAbility(abilityUpgrade).then((numAvailableUpgrades) => {
					this.abilities.set(abilityName, newAbility);
					this.abilitiesArray.push(abilityName);
					this.emit("abilityUpgrade", numAvailableUpgrades, newAbility);
					this.emit("newAbility");
					res(true);
				}).catch(() => res(false));
			}
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
		this.socket.emit("join", this.name, this.color, (dimensions, tiles, undergroundTiles, headPos, serverTPS, abilityOptions) => {
			this.emit("loadingStatus", "Loading");

			// snake is now alive, also reset direction
			this.alive = true;
			this.direction = [0, 0];

			// reset ability things
			this.abilities = new Map();
			this.numAvailableUpgrades = 0;
			this.emit("newAbility"); // causes ability-indicators to update

			// set and emit travelSpeed
			this.travelSpeed = 1 / serverTPS;
			this.emit("travelSpeed", this.travelSpeed);

			// initialize board state and head position
			this.genBoard(dimensions, tiles, undergroundTiles);
			this.olderHeadPos = headPos;
			this.oldHeadPos = headPos;
			this.headPos = headPos;

			this.abilityOptions = abilityOptions;

			this.emit("initialState", this.boardState, this.undergroundBoardState, 
				this.headPos, this.oldHeadPos, this.olderHeadPos, this.abilityOptions);
			this.emit("boardInitialized");
		});
	} 
	// generates board based on dimensions and tiles when joining game
	genBoard(dimensions, tiles, undergroundTiles) {
		// update normal board
		this.boardState = [];
		for (let y = 0; y < dimensions[1]; y++) {
			const row = [];
			for (let x = 0; x < dimensions[0]; x++) {
				row.push(new Tile([x, y]));
			}
			this.boardState.push(row);
		}
		this.updateBoard(this.boardState, this.undergroundBoardState, tiles);

		// update below ground board
		this.undergroundBoardState = [];
		for (let y = 0; y < dimensions[1]; y++) {
			const row = [];
			for (let x = 0; x < dimensions[0]; x++) {
				row.push(new Tile([x, y]));
			}
			this.undergroundBoardState.push(row);
		}
		this.updateBoard(this.boardState, this.undergroundBoardState, undergroundTiles);
	}

	// applies tile changes to board state
	// NOTE: also stores oldTile to tile.oldTile
	updateBoard(boardState, undergroundBoardState, tileChanges) {
		for (const tile of tileChanges) {
			let correctBoardState;
			if (tile.underground) correctBoardState = undergroundBoardState;
			else correctBoardState = boardState;

			const [x, y] = tile.position;
			tile.oldTile = correctBoardState[y][x];
			tile.animated = false;
			correctBoardState[y][x] = tile;
		}
	}
}

export default Client;