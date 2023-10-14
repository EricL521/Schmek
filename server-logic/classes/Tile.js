// represents a tile on the board
class Tile {
	// position is [x, y]
	// x is going right, y is going down
	// type is either 'snake' or 'food', or null if empty
	// size is a number, 1 or less, that scales the size of the tile
	constructor(position, type, color, size = 1) {
		this.position = position;
		this.color = color;

		this.type = type;
		this.size = size ?? 1;
	}
}

module.exports = { Tile };