const { Snake } = require("./Snake.js");
const { Tile } = require("./Tile.js");

// contains the logic for the game
class Game {
	// dimensions is an array of [width, height]
	constructor(dimensions, numFood = 0) {
		this.dimensions = dimensions;
		// tiles is a map of positions to Tile objects
		// emptyTiles is a set of positions
		[this.tiles, this.undergroundTiles, this.emptyTiles] = this.initializeTiles(this.dimensions);
		this.snakes = new Map(); // maps socket to snake
		this.nonPlayerSnakes = new Set(); // stores snakes that aren't controlled by a player
		this.sockets = new Set(); // stores all sockets that are currently in the game, even if they are dead
		this.deadSnakes = new Set(); // stores dead snakes

		// store tps of updates
		this.tps = 0;
		
		// generate food
		this.generateFood(numFood, true, true);
	}
	get tilesArray() { return Array.from(this.tiles.values()); }
	get undergroundTilesArray() { return Array.from(this.undergroundTiles.values()); }
	initializeTiles(dimensions) {
		const tiles = new Map();
		const undergroundTiles = new Map();
		const emptyTiles = new Set();
		console.log("Generating Tiles...");
		for (let y = 0; y < dimensions[0]; y++) {
			if (process.stdout.isTTY) {
				process.stdout.cursorTo(0); // move cursor to beginning of line
				process.stdout.write("Row " + (y + 1) + "/" + dimensions[0]);
			}

			for (let x = 0; x < dimensions[1]; x++) 
				emptyTiles.add(Tile.positionToString([x, y]));
		}
		console.log(); // move cursor to next line
		return [tiles, undergroundTiles, emptyTiles];
	}

	// adds a snake to the game
	// returns snake
	addSnake(socket, name, color, initialLength = 3) {
		// kill snake if it already exists
		this.killSnake(this.getSnake(socket));

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
	reviveSnake(snake) {
		// if snake is alive, do nothing
		if (snake.alive) return;

		// remove from deadSnakes
		this.deadSnakes.delete(snake);
		// add to snakes or nonPlayerSnakes
		if (snake.socket) this.snakes.set(snake.socket, snake);
		else this.nonPlayerSnakes.add(snake);

		snake.alive = true;
	}
	// adds a dead snake to the game
	addDeadSnake(socket, name, color, body, update = true) {
		// kill snake if it already exists
		this.killSnake(this.getSnake(socket));

		// create snake
		const snake = new Snake(socket, name, color, body, [0, 0]);
		this.killSnake(snake); // kill snake

		// add socket to sockets
		if (socket) this.sockets.add(socket);

		// update board and other snakes
		if (update) {
			this.updateBoard(body);
			this.updatePlayers(body);
		}

		return snake;
	}
	killSnake(snake) {
		if (!snake) return; // if snake doesn't exist, return

		// remove snake from snakes and add to deadSnakes
		this.snakes.delete(snake.socket);
		this.deadSnakes.add(snake);

		// kill snake, and update board ONLY
		// other snakes aren't updated, because the only that changes is the dead property
		this.updateBoard(snake.kill());
	}
	getSnake(socket) { return this.snakes.get(socket); }
	// activates the snake's ability
	activateAbility(socket, abilityName) {
		// get snake
		const snake = this.getSnake(socket);
		if (!snake) return;

		// activate ability
		const output = snake.activateAbility(abilityName, this);
		if (!output) return; // if snake doesn't have an ability, return

		const [tileChanges, clientInfo] = output.length? output: [];
		// update board and snakes
		if (tileChanges && tileChanges.length > 0) {
			this.updateBoard(tileChanges);
			this.updatePlayers(tileChanges);
		}

		// sometimes clientInfo is null, but the ability has still executed, so we return empty array
		return clientInfo?? [];
	}

	// updates tps times per second
	startUpdateLoop(tps) {
		this.tps = tps;
		this.interval = setInterval(() => {
			this.update();
		}, 1000 / tps);
	}
	// stops update loop
	stopUpdateLoop() {
		this.tps = 0;
		clearInterval(this.interval);
	}

	// main update function, called every tick
	update() {
		const tileChanges = [];
		// update all snakes
		for (const snake of this.snakes.values()) tileChanges.push(...this.updateSnake(snake));
		for (const snake of this.nonPlayerSnakes) tileChanges.push(...this.updateSnake(snake));

		// merge tileChanges into board
		this.updateBoard(tileChanges);
		// send tileChanges to all snakes
		this.updatePlayers(tileChanges);
	}
	updateSnake(snake) {
		if (!snake.alive || snake.speed === 0) return []; // skip dead snakes, and non-moving snakes

		// keep track of changed Tiles
		const tileChanges = [];
		
		// update old head (NOTE: this ALWAYS updates tileChanges)
		tileChanges.push(...snake.updateHeadBorderRadius());

		let [snakeTileChanges, newHeadPos] = snake.updateHead();

		// if snake is in bounds, check if it has hit anything
		if (this.isInBounds(newHeadPos)) {
			const newHeadTile = (snake.underground? this.undergroundTiles: this.tiles).get(Tile.positionToString(newHeadPos));

			const updateFunctions = snake.customUpdateFunctions.concat(Snake.defaultUpdateFunctions);
			// killSnake is only true if every function returns true
			const killSnake = updateFunctions.every(updateFunction => {
				const result = updateFunction(this, snake, newHeadTile);
				if (result === "kill") return true; // if result is "kill", kill snake
				if (result) { // if result is an array, add result to tileChanges and stop executing functions
					if (!Array.isArray(result)) console.error("Custom function must return an array of tile updates");
					else {
						snakeTileChanges.push(...result);
						return false; // stop executing functions
					}
				}
				return true; // continue if we haven't returned anything yet
			});
			// if none of the functions returned anything truthy, or if result was kill, snake dies
			if (killSnake) {
				// undo head update and snakeTileChanges
				snake.removeHead();
				snakeTileChanges = [];
				// kill snake
				this.killSnake(snake);
			}
		}
		// if it's not in bounds, the snake dies
		else {
			// undo head update and snakeTileChanges
			snake.removeHead();
			snakeTileChanges = [];
			// kill snake
			this.killSnake(snake);
		}

		// add snakeTileChanges to tileChanges
		tileChanges.push(...snakeTileChanges);
		
		return tileChanges;
	}
	// updates tiles and emptyTiles based on tileChanges
	updateBoard(tileChanges) {
		for (const tile of tileChanges) {
			if (tile.underground) {
				if (tile.color == null) this.undergroundTiles.delete(tile.positionString);
				else this.undergroundTiles.set(tile.positionString, tile);
			}
			else {
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
	}
	// sends out tileChanges to all players
	updatePlayers(tileChanges) {
		for (const socket of this.sockets) {
			const snake = this.snakes.get(socket);
			if (snake)
				snake.sendGameUpdate(tileChanges, this.tps);
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
	// updatePlayers is whether to update players after generating food
	generateFood(numFood = 1, log = false, updatePlayers = false) {
		const tileChanges = [];
		if (log) console.log("Generating Food...");
		this.getRandomEmptyPos(numFood).forEach((pos, i) => {
			if (log) {
				if (process.stdout.isTTY) {
					process.stdout.cursorTo(0); // move cursor to beginning of line
					process.stdout.write("Apple " + (i + 1) + "/" + numFood);
				}
			}
			const food = new Tile(pos, "food", "red", 0.8, [25, 25, 25, 25]);
			tileChanges.push(food);
		});
		if (log) console.log(); // move cursor to next line
		// update board and other snakes if updatePlayers is true
		if (updatePlayers) {
			this.updateBoard(tileChanges);
			this.updatePlayers(tileChanges);
		}
		return tileChanges;
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