module.exports = {
	eventName: "upgradeAbility",
	function: (game, socket, abilityName, callback) => {
		// get snake
		const snake = game.getSnake(socket);
		// if snake doesn't exist or is dead, do nothing
		if ( !snake || !snake.alive ) return;

		const [newOptions, isUpgrade, cooldown] = snake.upgradeAbility(abilityName);
		callback(newOptions, isUpgrade, cooldown);
	}
};
