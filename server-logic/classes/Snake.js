const { Tile } = require("./Tile.js");
const { AbilityManager } = require("./Ability-Manager.js");

// represents a snake, dead or alive
// if alive, it represents a person's snake
class Snake extends AbilityManager {
	// functions that run to check snake head during update
	// runs ever function in the array, in order until one returns something an array
	// if none of them return something truthy, the snake dies
	static defaultUpdateFunctions = [
		(_, snake, newHeadTile) => { if (!newHeadTile) return snake.updateTail(); },
		(_, snake, newHeadTile) => { if (newHeadTile.positionString === snake.tail.positionString) return snake.updateTail(false); },
		(game, _, newHeadTile) => { if (newHeadTile.type === "food") { game.generateFood(); return []; } },
	];

	constructor(socket, name, color, body, direction) {
		super();

		this.socket = socket;
		this.name = name;
		this.color = color;
		this.alive = true;
		// body is an array of Tile objects, with the tail at index 0
		this.body = body;
		// currentDirection is the direction the snake last moved
		this.currentDirection = null;
		this.setDirection(direction, true); // [x, y]

		// custom update functions, which run AFTER default update functions
		this.customUpdateFunctions = [];
	}

	// returns new direction, NOTE: may not equal the direction passed in, depending on the current direction
	setDirection(newDirection, initial) {
		// if newDirection is the opposite of prevDirection, don't change direction
		if (this.currentDirection && (newDirection[0] == -this.currentDirection[0] && newDirection[1] == -this.currentDirection[1])) 
			return this.newDirection;

		this.emit("directionChange", newDirection, this.newDirection);
		
		const magnitude = Math.abs(newDirection[0] + newDirection[1]);
		if ( magnitude == 1 || (initial && magnitude <= 1) )
			this.newDirection = newDirection;

		return this.newDirection;
	}
	get speed() { return Math.abs(this.newDirection[0] + this.newDirection[1]); }

	// returns tileChanges
	// adds round to current head
	// updating is whether we're adding a new head, or updating the head without moving
	updateHeadBorderRadius(updating = true) {
		this.emit("updateHeadBorderRadius");

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
		if (this.speed !== 0) {
			const head = this.head;
			// add rounded corner to old head, depending on current direction and new direction
			if (this.currentDirection) {
				// NOTE: y is inverted, so 1 is down, -1 is up
				const deltaDirection = [
					this.newDirection[0] - this.currentDirection[0],
					this.newDirection[1] - this.currentDirection[1]
				];
				head.borderRadius = [
					deltaDirection[0] == 1 && deltaDirection[1] == 1 ? 100 : 0,
					deltaDirection[0] == -1 && deltaDirection[1] == 1 ? 100 : 0,
					deltaDirection[0] == -1 && deltaDirection[1] == -1 ? 100 : 0,
					deltaDirection[0] == 1 && deltaDirection[1] == -1 ? 100 : 0
				];
				tileChanges.push(head); // add old head to tileChanges
			}
		}

		return tileChanges;
	}
	// returns tileChanges
	updateTailBorderRadius() {
		this.emit("updateTailBorderRadius");

		// don't update if snake is not moving
		if (this.speed === 0) return [];

		// update new tail border radius
		const tail = this.tail;
		let tailDirection = tail.direction;
		let nextTailDirection = this.body[1].direction;
		let defaultBorderRadius = tail.borderRadius; // what it defaults to if no rounded corners are needed
		// if tailDirection is zero, use the first non-zero direction, from the tail
		if (tailDirection[0] + tailDirection[1] == 0)
			for (let i = 1; i < this.body.length; i++)
				if (this.body[i].direction[0] + this.body[i].direction[1] != 0) {
					tailDirection = this.body[i].direction;
					nextTailDirection = this.body[i - 1].direction;
					// also make default border radius 0
					defaultBorderRadius = [0, 0, 0, 0];
					break;
				}
		tail.borderRadius = [
			(tailDirection[0] == 1 && nextTailDirection[1] !== -1) || (tailDirection[1] == 1 && nextTailDirection[0] !== -1) ? 25 : defaultBorderRadius[0],
			(tailDirection[0] == -1 && nextTailDirection[1] !== -1) || (tailDirection[1] == 1 && nextTailDirection[0] !== 1) ? 25 : defaultBorderRadius[1],
			(tailDirection[0] == -1 && nextTailDirection[1] !== 1) || (tailDirection[1] == -1 && nextTailDirection[0] !== 1) ? 25 : defaultBorderRadius[2],
			(tailDirection[0] == 1 && nextTailDirection[1] !== 1) || (tailDirection[1] == -1 && nextTailDirection[0] !== -1) ? 25 : defaultBorderRadius[3]
		];
		// return tileChanges
		return [tail];
	}
	// returns [tileChanges, newHeadPos]
	updateHead() {
		this.emit("updateHead");

		// keep track of changed Tiles
		const tileChanges = [];

		// only update if snake is moving
		if (this.speed !== 0) {
			// add new head
			const oldHeadPos = this.head.position;
			const newHeadPos = [oldHeadPos[0] + this.newDirection[0], oldHeadPos[1] + this.newDirection[1]];
			this.body.push(new Tile(newHeadPos, "snake", this.color, null, [
				this.newDirection[0] == -1 || this.newDirection[1] == -1 ? 50 : 0,
				this.newDirection[0] == 1 || this.newDirection[1] == -1 ? 50 : 0,
				this.newDirection[0] == 1 || this.newDirection[1] == 1 ? 50 : 0,
				this.newDirection[0] == -1 || this.newDirection[1] == 1 ? 50 : 0
			], this.newDirection));
			tileChanges.push(this.head); // add new head to tileChanges

			// update currentDirection
			this.currentDirection = this.newDirection;
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
		if (this.speed !== 0) {
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
	sendGameUpdate(tileChanges) {
		if (this.socket) this.socket.emit("gameUpdate", tileChanges, this.head.position);
	}
}

module.exports = { Snake };