module.exports = {
	eventName: "direction",
	function: (game, socket, direction) => {
		const snake = game.getSnake(socket);
		if (snake == null) return;

		snake.setDirection(direction);
	}
};