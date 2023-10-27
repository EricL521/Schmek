const { Snake } = require("./Snake.js");
const { Tile } = require("./Tile.js");

// contains the logic for the game
class Game {
	// dimensions is an array of [width, height]
	constructor(dimensions, numFood = 0) {
		// board is a 2d array of Tile objects, emptyTiles is a set of positions
		[this.board, this.emptyTiles] = this.initializeBoard(dimensions);
		this.snakes = new Map(); // maps socket to snake
		this.sockets = new Set(); // stores all sockets that are currently in the game, even if they are dead
		this.deadSnakes = new Set(); // stores dead snakes
		
		// generate food
		this.generateFood(numFood);
	}
	initializeBoard(dimensions) {
		const board = [];
		const emptyTiles = new Set();
		for (let y = 0; y < dimensions[0]; y++) {
			board.push([]);
			for (let x = 0; x < dimensions[1]; x++) {
				board[y].push(new Tile([x, y], null));
				emptyTiles.add(board[y][x].positionString);
			}
		}
		return [board, emptyTiles];
	}

	// adds a snake to the game
	// returns snake
	addSnake(socket, name, color, initialLength = 3) {
		// randomly generate a head position for the snake
		const headPos = this.getRandomEmptyPos();
		const body = Array(initialLength).fill(new Tile(headPos, "snake", color)); // body is 3 tiles long
		const direction = [0, 0]; // default to no movement

		// update board and other snakes
		this.updateBoard(body);
		this.updatePlayers(body);

		// create snake
		const snake = new Snake(socket, name, color, body, direction);
		this.snakes.set(socket, snake);

		// add socket to sockets
		this.sockets.add(socket);

		return snake;
	}
	killSnake(socket) {
		const snake = this.snakes.get(socket);
		if (!snake) return; // if snake doesn't exist, return

		// kill snake
		snake.kill();
		// remove snake from snakes and add to deadSnakes
		this.snakes.delete(socket);
		this.deadSnakes.add(snake);
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
		// update all snakes
		for (const snake of this.snakes.values()) {
			if (!snake.alive || snake.speed === 0) continue; // skip dead snakes, and non-moving snakes

			// update old head (NOTE: this ALWAYS updates tileChanges)
			tileChanges.push(...snake.updateOldHead());

			let [snakeTileChanges, newHeadPos] = snake.updateHead();

			const [x, y] = newHeadPos;
			// if snake is in bounds, check if it has hit anything
			if (this.isInBounds(newHeadPos)) {
				const newHeadTile = this.board[y][x];
				// if snake hit empty tile
				if (newHeadTile.type === null) snakeTileChanges.push(...snake.updateTail());
				// if snake hits its own tail, it doesn't die
				else if (newHeadTile.positionString === snake.tail.positionString) snake.updateTail();
				// snake hit food
				else if (newHeadTile.type === "food") this.generateFood();
				// if it's not any of those, the snake dies
				else {
					this.killSnake(snake.socket);
					// also undo head update and snakeTileChanges
					snake.removeHead();
					snakeTileChanges = [];
				}
			}
			// if it's not in bounds, the snake dies
			else {
				this.killSnake(snake.socket);
				// also undo head update and snakeTileChanges
				snake.removeHead();
				snakeTileChanges = [];
			}

			// add snakeTileChanges to tileChanges
			tileChanges.push(...snakeTileChanges);
		}

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
				this.emptyTiles.add(tile.positionString);
			else
				this.emptyTiles.delete(tile.positionString);
		}
	}
	// sends out tileChanges to all players
	updatePlayers(tileChanges) {
		for (const socket of this.sockets) {
			const snake = this.snakes.get(socket);
			if (snake)
				snake.sendGameUpdate(tileChanges);
			else
				socket.emit("gameUpdate", tileChanges, null);
		}
	}

	// position is [x, y]
	// returns true if position is in bounds
	isInBounds(position) {
		const [x, y] = position;
		return x >= 0 && x < this.board[0].length && y >= 0 && y < this.board.length;
	}

	// generates numFood food tiles
	generateFood(numFood = 1) {
		const tileChanges = [];
		for (let i = 0; i < numFood; i++) {
			const food = new Tile(this.getRandomEmptyPos(), "food", "red", 0.8, [25, 25, 25, 25]);
			tileChanges.push(food);

			// apply changes to board to update emptyTiles
			this.updateBoard([food]);
		}
		this.updatePlayers(tileChanges);
	}
	// returns a random empty position
	getRandomEmptyPos() {
		const emptyTilesArray = Array.from(this.emptyTiles);
		return Tile.stringToPosition(emptyTilesArray[Math.floor(Math.random() * emptyTilesArray.length)]);
	}
}

module.exports = { Game };