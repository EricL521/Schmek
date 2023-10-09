// represents a tile on the board
class Tile {
	// position is [x, y]
	// if color is null, tile is empty
	constructor(position, color) {
		this.position = position;
		this.color = color;
	}
}

module.exports = { Tile };