// creates game object
const { Game } = require("./classes/Game.js");
const { dimensions, tps, numFood } = require("./game-config.json");

const initializeGame = () => {
	console.log("\nInitializing game...");
	const game = new Game(dimensions, numFood);
	console.log(); // move cursor to next line
	// start update loop
	game.startUpdateLoop(tps);

	return game;
};

module.exports = { initializeGame };