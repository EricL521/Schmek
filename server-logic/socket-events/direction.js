module.exports = {
	eventName: "direction",
	function: (game, socket, direction, callback) => {
		const snake = game.getSnake(socket);
		// if snake doesn't exist or is dead, do nothing
		if ( !snake || !snake.alive ) return;

		callback(snake.setDirection(direction));
	}
};