module.exports = {
	eventName: "activateAbility",
	function: (game, channel, {abilityName}) => {
		// send headPos and new direction to client
		const output = game.activateAbility(channel, abilityName);
		if (output) // if ability is activated output is defined
			channel.emit("activateAbilityCallback", {abilityName, success: true, ...output});
		else channel.emit("activateAbilityCallback", {abilityName, success: false}); // otherwise send false
	}
};
