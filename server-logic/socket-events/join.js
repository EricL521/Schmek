module.exports = {
	eventName: "join",
	function: (game, socket, name, callback) => {
		// add snake to game
		const snake = game.addSnake(socket, name, "blue");
		// send game state to client
		callback(game.board, snake.head.position);
	}
};