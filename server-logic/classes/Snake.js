const { Tile } = require("./Tile.js");
const { AbilityManager } = require("./Ability-Manager.js");

// at what lengths of the snake to give abilities
// NOTE: Currently, there is only 3 max upgrades, so there's 3 lengths
const abilityUpgradeLengths = new Set([
	10, 20, 40
]);

// represents a snake, dead or alive
// if alive, it represents a person's snake
class Snake extends AbilityManager {
	// functions that run to check snake head during update
	// runs ever function in the array, in order until one returns something an array
	// if none of them return something truthy, the snake dies
	static defaultUpdateFunctions = [
		(_, snake, newHeadTile) => { if (!newHeadTile) return snake.updateTail(); },
		// NOTE: the false is to tell updateTail to not add the removed tail to tileChanges; it is changed by the head instead
		(_, snake, newHeadTile) => { if (newHeadTile.positionString === snake.tail.positionString) return snake.updateTail(false); },
		(game, snake, newHeadTile) => { 
			if (newHeadTile.type === "food") { 
				const tileChanges = [];
				snake.emit("grow"); // used in abilityManager to determine giving abilities
				tileChanges.push(...game.generateFood()); 
				// if snake tail is still circular (from when snake first spawned), update it
				if (snake.tail.borderRadius[0] == 50 && snake.tail.borderRadius[1] == 50 && 
					snake.tail.borderRadius[2] == 50 && snake.tail.borderRadius[3] == 50)
					tileChanges.push(...snake.updateTailBorderRadius()); 
				return tileChanges;
			}
		},
	];

	// a helper function that sums an array
	static sumArray(array) {
		return array.reduce((a, b) => a + b, 0);
	}

	constructor(socket, name, color, body, direction) {
		super();
		this.initializeAbilityUpgradeListener();

		this.socket = socket;
		this.name = name;
		this.color = color;
		this.alive = true;
		// body is an array of Tile objects, with the tail at index 0
		this.body = body;
		// currentDirection is the direction the snake last moved
		this.currentDirection = null;
		this.setDirection(direction, true); // [x, y]
		// speed is how many times per main game tick the snake moves
		this.speed = 1;

		// custom update functions, which run AFTER default update functions
		this.customUpdateFunctions = [];
	}
	// adds listener for snake length, and emits event 
	// for client to pick an ability or subability
	initializeAbilityUpgradeListener() {
		this.availableUpgrades = 0;
		this.on("grow", () => {
			// if snake length is in abilityUpgradeLengths, emit event
			if (abilityUpgradeLengths.has(this.body.length)) {
				this.availableUpgrades ++;
				const isUpgrade = this.ability? true : false; // if there's an ability, you can only upgrade it
				this.socket.emit("abilityUpgrade", this.subabilitiesArray, isUpgrade);
			}
		});
	}
	// override default upgradeAbility to add availableUpgrades logic
	// returns [subabilitiesArray, isUpgrade, cooldown]
	// NOTE: subabilitiesArray only returns if ability was added successfully and upgrades are available
	upgradeAbility(subability) {
		if (this.availableUpgrades <= 0) return [null];

		// result is whether or not it was successful
		const result = super.upgradeAbility(subability);
		if (result) this.availableUpgrades --;
		const isUpgrade = this.ability? true : false; // if there's an ability, you can only upgrade it
		return [result && this.availableUpgrades > 0 ? this.subabilitiesArray : null, isUpgrade, this.cooldown];
	}

	// returns new direction, NOTE: may not equal the direction passed in, depending on the current direction
	setDirection(newDirection, initial) {
		// if newDirection is the opposite of prevDirection, don't change direction
		if (this.currentDirection && (newDirection[0] == -this.currentDirection[0] && newDirection[1] == -this.currentDirection[1])) 
			return this.newDirection;

		this.emit("directionChange", newDirection, this.newDirection);
		
		const magnitude = Math.abs(Snake.sumArray(newDirection));
		if ( magnitude == 1 || (initial && magnitude <= 1) )
			this.newDirection = newDirection;

		return this.newDirection;
	}
	get directionMagnitude() { return Math.abs(Snake.sumArray(this.newDirection)); }

	// returns tileChanges
	// adds round to current head (when snake turns, we add a curve to one of the corners)
	// updating is whether we're adding a new head, or updating the head without moving
	// in which case, we make the head a semi-circle
	// also updates directionOut and isHead of old head and all previous tiles if necessary
	updateHeadBorderRadius(updating = true) {
		this.emit("updateHeadBorderRadius", updating);

		// keep track of changed Tiles
		const tileChanges = [];

		// if we're not updating, just add the 50% rounded corner
		if (!updating) {
			const head = this.head;
			head.borderRadius = [
				this.currentDirection[0] == -1 || this.currentDirection[1] == -1 ? 50 : 0,
				this.currentDirection[0] == 1 || this.currentDirection[1] == -1 ? 50 : 0,
				this.currentDirection[0] == 1 || this.currentDirection[1] == 1 ? 50 : 0,
				this.currentDirection[0] == -1 || this.currentDirection[1] == 1 ? 50 : 0
			];
			tileChanges.push(head); // add new head to tileChanges
			return tileChanges; // don't run normal code
		}

		// only update if snake is moving
		if (this.directionMagnitude !== 0) {
			// add rounded corner to old head, depending on current direction and new direction
			if (this.currentDirection) {
				// NOTE: y is inverted, so 1 is down, -1 is up
				const deltaDirection = [
					this.newDirection[0] - this.currentDirection[0],
					this.newDirection[1] - this.currentDirection[1]
				];
				this.head.borderRadius = [
					deltaDirection[0] == 1 && deltaDirection[1] == 1 ? 100 : 0,
					deltaDirection[0] == -1 && deltaDirection[1] == 1 ? 100 : 0,
					deltaDirection[0] == -1 && deltaDirection[1] == -1 ? 100 : 0,
					deltaDirection[0] == 1 && deltaDirection[1] == -1 ? 100 : 0
				];
				// old head is now not going to be a head, so set head to false
				this.head.isHead = false;
				// set directionOut of old head to new direction
				this.head.directionOut = this.newDirection;
				// add old head to tileChanges
				tileChanges.push(this.head); 

				// this isn't in tileChanges, but if the snake just spawned, 
				// the earlier tiles also won't have a directionOut, so we add it here
				for (let i = 0; i < this.body.length - 1; i++) {
					if (Snake.sumArray(this.body[i].directionOut) == 0)
						this.body[i].directionOut = this.newDirection;
					else break; // stop when we find a tile with a directionOut
				}
			}
		}

		return tileChanges;
	}
	// returns tileChanges
	updateTailBorderRadius() {
		this.emit("updateTailBorderRadius");

		// don't update if snake is not moving
		if (this.directionMagnitude === 0) return [];

		// update new tail border radius
		const tail = this.tail;
		let tailDirectionIn = tail.directionIn;
		let tailDirectionOut = tail.directionOut;
		let defaultBorderRadius = tail.borderRadius; // what it defaults to if no borderRadius is needed
		// if tailDirection is zero, use the first non-zero direction, from the tail
		if (Snake.sumArray(tailDirectionIn) == 0 || Snake.sumArray(tailDirectionIn) == 0) {
			// make default border radius 0 (since snake starts as a circle, this overrides that)
			defaultBorderRadius = [0, 0, 0, 0];
			for (let i = 1; i < this.body.length; i++) {
				// check for directionIn, if not found already
				if (Snake.sumArray(tailDirectionIn) == 0 && Snake.sumArray(this.body[i].directionIn) != 0)
					tailDirectionIn = this.body[i].directionIn;
				// check for directionOut, if not found already
				if (Snake.sumArray(tailDirectionOut) == 0 && Snake.sumArray(this.body[i].directionOut) != 0)
					tailDirectionOut = this.body[i].directionOut;
				// if both are found, break
				if (Snake.sumArray(tailDirectionIn) != 0 && Snake.sumArray(tailDirectionOut) != 0) break;
			}
		}
		tail.borderRadius = [
			(tailDirectionIn[0] == 1 && tailDirectionOut[1] !== -1) || (tailDirectionIn[1] == 1 && tailDirectionOut[0] !== -1) ? 25 : defaultBorderRadius[0],
			(tailDirectionIn[0] == -1 && tailDirectionOut[1] !== -1) || (tailDirectionIn[1] == 1 && tailDirectionOut[0] !== 1) ? 25 : defaultBorderRadius[1],
			(tailDirectionIn[0] == -1 && tailDirectionOut[1] !== 1) || (tailDirectionIn[1] == -1 && tailDirectionOut[0] !== 1) ? 25 : defaultBorderRadius[2],
			(tailDirectionIn[0] == 1 && tailDirectionOut[1] !== 1) || (tailDirectionIn[1] == -1 && tailDirectionOut[0] !== -1) ? 25 : defaultBorderRadius[3]
		];
		// set tail.tail to true
		tail.isTail = true;
		// return tileChanges
		return [tail];
	}
	// returns [tileChanges, newHeadPos]
	updateHead() {
		this.emit("updateHead");

		// keep track of changed Tiles
		const tileChanges = [];

		// only update if snake is moving
		if (this.directionMagnitude !== 0) {
			// add new head
			const oldHeadPos = this.head.position;
			const newHeadPos = [oldHeadPos[0] + this.newDirection[0], oldHeadPos[1] + this.newDirection[1]];
			this.body.push(new Tile(newHeadPos, "snake", this.color, null, null, this.newDirection, null, true, false));
			// update currentDirection
			this.currentDirection = this.newDirection;
			// add new head to tileChanges, after applying border radius
			// NOTE: we are no longer updating the head, so we pass false to updateHeadBorderRadius
			tileChanges.push(...this.updateHeadBorderRadius(false)); 
		}

		// return all TileChanges, and new head position
		return [tileChanges, this.head.position];
	}
	// returns tileChanges
	removeHead() {
		this.emit("removeHead");
		return [this.body.pop()];
	}
	// returns tileChanges
	updateTail(addRemovedTailToChanges = true) {
		this.emit("updateTail");

		// keep track of changed Tiles
		const tileChanges = [];

		// only update if snake is moving
		if (this.directionMagnitude !== 0) {
			const oldTailPos = this.body.shift().position;
			const newTailPos = this.tail.position;
			// if new tail is not the same as old tail, add old tail to tileChanges
			if (addRemovedTailToChanges && !(oldTailPos[0] == newTailPos[0] && oldTailPos[1] == newTailPos[1])) 
				tileChanges.push(new Tile(oldTailPos, null, null));

			// update new tail border radius
			tileChanges.push(...this.updateTailBorderRadius());
		}

		// return tileChanges
		return tileChanges;
	}
	get head() { return this.body[this.body.length - 1]; }
	get tail() { return this.body[0]; }

	// kills snake
	kill() {
		this.emit("death");

		this.alive = false;
		// send death message to client
		if (this.socket) this.socket.emit("death", { length: this.body.length });
		// update all tiles in body
		const tileChanges = [];
		this.body.forEach(tile => {
			tile.dead = true;
			tileChanges.push(tile);
		});
		return tileChanges;
	}

	// sends game updates to client
	// should be an array of Tile objects
	// also sends new head position
	sendGameUpdate(tileChanges, gameTPS) {
		if (this.socket) this.socket.emit("gameUpdate", tileChanges, this.head.position, this.speed * gameTPS);
	}
}

module.exports = { Snake };