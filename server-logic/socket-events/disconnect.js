module.exports = {
	eventName: "disconnect",
	function: (game, socket) => {
		// remove snake and socket from game
		game.killSnake(game.getSnake(socket));
		game.sockets.delete(socket);
	}
};