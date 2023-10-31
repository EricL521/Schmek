// creates game object
const { Game } = require("./classes/Game.js");
const { dimensions, tps, numFood } = require("./game-config.json");

const initializeGame = () => {
	console.log("Initializing game...");
	const game = new Game(dimensions, numFood);
	// start update loop
	game.startUpdateLoop(tps);

	return game;
};

module.exports = { initializeGame };