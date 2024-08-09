module.exports = {
	eventName: "disconnect",
	function: (game, channel) => {
		// remove snake and socket from game
		game.killSnake(game.getSnake(channel));
		game.channels.delete(channel);
	}
};