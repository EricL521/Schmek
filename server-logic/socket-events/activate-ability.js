module.exports = {
	eventName: "activateAbility",
	function: (game, socket, callback) => {
		// send headPos and new direction to client
		const output = game.activateAbility(socket);
		if (output) // returns if ability is activated
			callback(...output);
	}
};
