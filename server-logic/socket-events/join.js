module.exports = {
	eventName: "join",
	function: (game, socket, name, color, callback) => {
		// add snake to game
		const snake = game.addSnake(socket, name, color);
		// send game state to client
		callback(game.dimensions, game.tilesArray, game.undergroundTilesArray, snake.head.position, game.tps);
	}
};