module.exports = {
	eventName: "activateAbility",
	function: (game, socket, abilityName, callback) => {
		// send headPos and new direction to client
		const output = game.activateAbility(socket, abilityName);
		if (output) // if ability is activated output is defined
			callback(true, ...output);
		else callback(false); // otherwise send false
	}
};
