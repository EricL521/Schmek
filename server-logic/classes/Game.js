const { Snake } = require("./Snake.js");
const { Tile } = require("./Tile.js");

// contains the logic for the game
class Game {
	// dimensions is an array of [width, height]
	constructor(dimensions) {
		[this.board, this.emptyTiles] = this.initializeBoard(dimensions);

		this.snakes = new Map(); // maps socket to snake
	}
	initializeBoard(dimensions) {
		const board = [];
		const emptyTiles = new Set();
		for (let y = 0; y < dimensions[0]; y++) {
			board.push([]);
			for (let x = 0; x < dimensions[1]; x++) {
				board[y].push(new Tile([x, y], null));
				emptyTiles.add(board[y][x]);
			}
		}
		return [board, emptyTiles];
	}

	// returns a random empty tile
	getRandomEmptyTile() {
		const emptyTilesArray = Array.from(this.emptyTiles);
		return emptyTilesArray[Math.floor(Math.random() * emptyTilesArray.length)];
	}

	// adds a snake to the game
	// returns snake
	addSnake(socket, name, color) {
		// randomly generate a head position for the snake
		const headPos = this.getRandomEmptyTile().position;
		const body = Array(3).fill(new Tile(headPos, color)); // body is 3 tiles long
		const direction = [0, 0]; // default to no movement

		// update board and other snakes
		this.updateBoard(body);
		this.updatePlayers(body);

		// create snake
		const snake = new Snake(socket, name, color, body, direction);
		this.snakes.set(socket, snake);

		return snake;
	}
	getSnake(socket) { return this.snakes.get(socket); }

	// updates tps times per second
	startUpdateLoop(tps) {
		this.interval = setInterval(() => {
			this.update();
		}, 1000 / tps);
	}
	// stops update loop
	stopUpdateLoop() {
		clearInterval(this.interval);
	}

	// main update function, called every tick
	update() {
		const tileChanges = [];
		for (const snake of this.snakes.values())
			tileChanges.push(...snake.update());
		
		// merge tileChanges into board
		this.updateBoard(tileChanges);
		// send tileChanges to all snakes
		this.updatePlayers(tileChanges);
	}
	// updates board and emptyTiles based on tileChanges
	updateBoard(tileChanges) {
		for (const tile of tileChanges) {
			const [x, y] = tile.position;
			this.board[y][x] = tile;
			
			if (tile.color == null)
				this.emptyTiles.add(tile);
			else
				this.emptyTiles.delete(tile);
		}
	}
	// sends out tileChanges to all snakes
	updatePlayers(tileChanges) {
		for (const snake of this.snakes.values())
			snake.sendGameUpdate(tileChanges);
	}
}

module.exports = { Game };