const { Snake } = require("./Snake.js");
const { Tile } = require("./Tile.js");

// contains the logic for the game
class Game {
	// dimensions is an array of [width, height]
	constructor(dimensions, numFood = 0) {
		this.dimensions = dimensions;
		// tiles is a map of positions to Tile objects
		// emptyTiles is a set of positions
		[this.tiles, this.emptyTiles] = this.initializeTiles(this.dimensions);
		this.snakes = new Map(); // maps socket to snake
		this.sockets = new Set(); // stores all sockets that are currently in the game, even if they are dead
		this.deadSnakes = new Set(); // stores dead snakes
		
		// generate food
		this.generateFood(numFood, true);
	}
	get tilesArray() { return Array.from(this.tiles.values()); }
	initializeTiles(dimensions) {
		const tiles = new Map();
		const emptyTiles = new Set();
		console.log("Generating Tiles...");
		for (let y = 0; y < dimensions[0]; y++) {
			process.stdout.cursorTo(0); // move cursor to beginning of line
			process.stdout.write("Row " + (y + 1) + "/" + dimensions[0]);

			for (let x = 0; x < dimensions[1]; x++) 
				emptyTiles.add(Tile.positionToString([x, y]));
		}
		console.log(); // move cursor to next line
		return [tiles, emptyTiles];
	}

	// adds a snake to the game
	// returns snake
	addSnake(socket, name, color, initialLength = 3) {
		// randomly generate a head position for the snake
		const [headPos] = this.getRandomEmptyPos(1);
		const body = Array(initialLength).fill(new Tile(headPos, "snake", color, null, [50, 50, 50, 50])); // body is 3 tiles long
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
			tileChanges.push(...snake.updateCurrentHeadBorderRadius());

			let [snakeTileChanges, newHeadPos] = snake.updateHead();

			// if snake is in bounds, check if it has hit anything
			if (this.isInBounds(newHeadPos)) {
				const newHeadTile = this.tiles.get(Tile.positionToString(newHeadPos));
				// if snake hit empty tile
				if (!newHeadTile) snakeTileChanges.push(...snake.updateTail());
				// if snake hits its own tail, it doesn't die
				else if (newHeadTile.positionString === snake.tail.positionString) snakeTileChanges.push(...snake.updateTail(false));
				// snake hit food
				else if (newHeadTile.type === "food") this.generateFood();
				// if it's not any of those, the snake dies
				else {
					// undo head update and snakeTileChanges
					snake.removeHead();
					snakeTileChanges = [];
					// kill snake
					this.killSnake(snake.socket);
				}
			}
			// if it's not in bounds, the snake dies
			else {
				// undo head update and snakeTileChanges
				snake.removeHead();
				snakeTileChanges = [];
				// kill snake
				this.killSnake(snake.socket);
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
			// update tiles and emptyTiles
			if (tile.color == null) {
				this.tiles.delete(tile.positionString);
				this.emptyTiles.add(tile.positionString);
			}
			else {
				this.tiles.set(tile.positionString, tile);
				this.emptyTiles.delete(tile.positionString);
			}
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
		return x >= 0 && x < this.dimensions[0] && y >= 0 && y < this.dimensions[1];
	}

	// generates numFood food tiles
	// log is whether to log progress to console
	generateFood(numFood = 1, log = false) {
		const tileChanges = [];
		if (log) console.log("Generating Food...");
		this.getRandomEmptyPos(numFood).forEach((pos, i) => {
			if (log) {
				process.stdout.cursorTo(0); // move cursor to beginning of line
				process.stdout.write("Apple " + (i + 1) + "/" + numFood);
			}
			const food = new Tile(pos, "food", "red", 0.8, [25, 25, 25, 25]);
			tileChanges.push(food);
		});
		if (log) console.log(); // move cursor to next line
		// update board and other snakes
		this.updateBoard(tileChanges);
		this.updatePlayers(tileChanges);
	}
	// returns a list of num empty tile positions
	getRandomEmptyPos(num) {
		// shuffling array is faster than picking them out one by one, unless num is one
		if (num === 1) return [Array.from(this.emptyTiles)[ Math.floor(Math.random() * this.emptyTiles.size) ]].map(Tile.stringToPosition);
		// if num isn't one, shuffle array
		const randomEmptyTiles = this.randomizeArray( Array.from(this.emptyTiles) ).slice(0, num);
		return randomEmptyTiles.map(Tile.stringToPosition);
	}
	// NOTE: THIS FUNCTION MODIFIES THE ARRAY
	randomizeArray(array) {
		for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
			// get random index up to and including i
			const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
			// swap elements
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}

		return array;
	}
}

module.exports = { Game };