// creates game object
const { Game } = require("./classes/Game.js");
const { dimensions, tps } = require("./game-config.json");

const initializeGame = () => {
	const game = new Game(dimensions);
	// start update loop
	game.startUpdateLoop(tps);

	return game;
};

module.exports = { initializeGame };