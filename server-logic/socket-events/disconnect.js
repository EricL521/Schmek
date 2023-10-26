module.exports = {
	eventName: "disconnect",
	function: (game, socket) => {
		// remove snake and socket from game
		game.killSnake(socket);
		game.sockets.delete(socket);
	}
};