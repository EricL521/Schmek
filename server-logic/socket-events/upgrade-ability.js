module.exports = {
	eventName: "upgradeAbility",
	function: (game, socket, abilityName, abilityUpgrade, callback) => {
		// get snake
		const snake = game.getSnake(socket);
		// if snake doesn't exist or is dead, do nothing
		if ( !snake || !snake.alive ) return callback();

		const [success, _, cooldown, numAvailableUpgrades] = snake.upgradeAbility(abilityName, abilityUpgrade);
		callback(success, abilityName, cooldown, numAvailableUpgrades);
	}
};
