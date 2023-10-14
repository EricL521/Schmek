const { Tile } = require("./Tile.js");

// represents a snake, dead or alive
// if alive, it represents a person's snake
class Snake {
	constructor(socket, name, color, body, direction) {
		this.socket = socket;
		this.name = name;
		this.color = color;
		this.alive = true;
		// body is an array of Tile objects, with the tail at index 0
		this.body = body;
		this.setDirection(direction, true); // [x, y]
	}

	setDirection(newDirection, initial) {
		const magnitude = Math.abs(newDirection[0] + newDirection[1]);
		if ( magnitude == 1 || (initial && magnitude <= 1) )
			this.direction = newDirection;
	}
	update() {
		// if dead, don't update
		if (!this.alive) return;

		// keep track of changed Tiles
		const tileChanges = [];

		const magnitude = Math.abs(this.direction[0] + this.direction[1]);
		// only update if snake is moving
		if (magnitude !== 0) {
			// update body
			// add new head
			const oldHeadPos = this.head.position;
			const newHeadPos = [oldHeadPos[0] + this.direction[0], oldHeadPos[1] + this.direction[1]];
			this.body.push(new Tile(newHeadPos, this.color));
			tileChanges.push(this.head); // add new head to tileChanges
			// remove tail
			const oldTailPos = this.body.shift().position;
			const newTailPos = this.tail.position;
			// if new tail is not the same as old tail, add old tail to tileChanges
			if (!(oldTailPos[0] == newTailPos[0] && oldTailPos[1] == newTailPos[1])) 
				tileChanges.push(new Tile(oldTailPos, null));
		}

		// return all TileChanges
		return tileChanges;
	}
	get head() { return this.body[this.body.length - 1]; }
	get tail() { return this.body[0]; }

	// sends game updates to client
	// should be an array of Tile objects
	// also sends new head position
	sendGameUpdate(tileChanges) {
		this.socket.emit("gameUpdate", tileChanges, this.head.position);
	}
}

module.exports = { Snake };