module.exports = {
	eventName: "direction",
	function: (game, channel, {direction}) => {
		const snake = game.getSnake(channel);
		// if snake doesn't exist or is dead, do nothing
		if ( !snake || !snake.alive ) return;

		channel.emit("directionCallback", snake.setDirection(direction));
	}
};