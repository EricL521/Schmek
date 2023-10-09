const { Tile } = require("./Tile.js");

// represents a snake, dead or alive
// if alive, it represents a person's snake
class Snake {
	constructor(socket, name, color, body, direction) {
		this.socket = socket;
		this.initializeSocket();
		this.name = name;
		this.color = color;
		this.alive = true;
		// body is an array of Tile objects, with the tail at index 0
		this.body = body;
		this.setDirection(direction, true); // [x, y]
	}

	// adds listeners for socket
	initializeSocket() {
		
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

		// update body
		// add new head
		const currentHeadPos = this.head.position;
		const newHeadPos = [currentHeadPos[0] + this.direction[0], currentHeadPos[1] + this.direction[1]];
		this.body.push(new Tile(newHeadPos, this.color));
		tileChanges.push(this.head); // add new head to tileChanges
		// remove tail
		tileChanges.push(new Tile(this.body.shift().position, null)); // remove tail and add to tileChanges

		// return all TileChanges
		return tileChanges;
	}
	get head() {
		return this.body[this.body.length - 1];
	}

	// sends game updates to client
	// should be an array of Tile objects
	// also sends new head position
	sendGameUpdate(changes) {
		this.socket.emit("gameUpdate", changes, this.head.position);
	}
}

module.exports = { Snake };