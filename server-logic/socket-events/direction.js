module.exports = {
	eventName: "direction",
	function: (game, socket, direction) => {
		const snake = game.getSnake(socket);
		// if snake doesn't exist or is dead
		if ( !snake || !snake.alive ) return;

		snake.setDirection(direction);
	}
};