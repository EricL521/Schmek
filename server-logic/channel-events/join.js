const { AbilityManager } = require("../classes/Ability-Manager");

module.exports = {
	eventName: "join",
	function: (game, channel, {name, color}) => {
		// add snake to game
		const snake = game.addSnake(channel, name, color);
		// send game state to client
		channel.emit("joinCallback", {
			dimensions: game.dimensions, 
			tiles: game.tilesArray, 
			undergroundTiles: game.undergroundTilesArray, 
			headPos: snake.head.position, 
			serverTPS: game.tps, 
			abilityOptions: AbilityManager.abilityOptionsArray
		}, { reliable: true });
	}
};