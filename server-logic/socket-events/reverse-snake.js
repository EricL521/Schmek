module.exports = {
	eventName: "reverseSnake",
	function: (game, socket, callback) => {
		const snake = game.getSnake(socket);
		// if snake doesn't exist or is dead, do nothing
		if ( !snake || !snake.alive ) return;

		// send headPos and new direction to client
		callback(...snake.reverse());
	}
};