// represents a tile on the board
class Tile {
	static stringToPosition(positionString) {
		const [x, y] = positionString.split(",");
		return [parseInt(x), parseInt(y)];
	}
	static positionToString(position) {
		return position.toString();
	}

	// position is [x, y]
	// x is going right, y is going down
	// type is either 'snake' or 'food', or null if empty
	// size is a number, 1 or less, that scales the size of the tile
	// borderRadius is an array of 4 numbers, topleft, topright, bottomright, bottomleft, of the border radius (in percent)
	// direction is [x, y]
	constructor(position, type, color, size = 1, borderRadius = [0, 0, 0, 0], direction = [0, 0]) {
		this.position = position;
		this.color = color;
		this.size = size ?? 1;
		this.borderRadius = borderRadius?? [0, 0, 0, 0];
		this.direction = direction ?? [0, 0];

		this.type = type;
	}
	get positionString() { return Tile.positionToString(this.position); }

	// NOTE: this function excludes this.dead, which is added when a snake dies
	toJSON() {
		return {
			position: this.position,
			color: this.color,
			size: this.size,
			borderRadius: this.borderRadius,
			direction: this.direction,
			type: this.type
		};
	}
}

module.exports = { Tile };