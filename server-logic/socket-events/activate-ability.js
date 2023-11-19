module.exports = {
	eventName: "activateAbility",
	function: (game, socket, callback) => {
		// send headPos and new direction to client
		const output = game.activateAbility(socket);
		if (output)
			callback(...output);
	}
};
