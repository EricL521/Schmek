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
	// directionIn and directionOut are both [x, y]
	constructor(position, type, color, size = 1, borderRadius = [0, 0, 0, 0], 
		directionIn = [0, 0], directionOut = [0, 0], isHead = false, isTail = false) {
		this.position = position;
		this.color = color;
		this.size = size ?? 1;
		this.borderRadius = borderRadius?? [0, 0, 0, 0];
		this.directionIn = directionIn ?? [0, 0];
		this.directionOut = directionOut ?? [0, 0];

		this.type = type;
		this.isHead = isHead?? false;
		this.isTail = isTail?? false;
	}
	get positionString() { return Tile.positionToString(this.position); }

	// NOTE: this function excludes this.dead, which is added when a snake dies
	toJSON() {
		return {
			position: this.position,
			color: this.color,
			size: this.size,
			borderRadius: this.borderRadius,
			directionIn: this.directionIn,
			directionOut: this.directionOut,
			type: this.type,
			isHead: this.isHead,
			isTail: this.isTail
		};
	}
}

module.exports = { Tile };