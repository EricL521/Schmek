module.exports = {
	eventName: "upgradeAbility",
	function: (game, channel, {abilityName, abilityUpgrade}) => {
		// get snake
		const snake = game.getSnake(channel);
		// if snake doesn't exist or is dead, do nothing
		if ( !snake || !snake.alive ) return channel.emit("upgradeAbilityCallback");

		const {success, cooldown, numAvailableUpgrades} = snake.upgradeAbility(abilityName, abilityUpgrade);
		channel.emit("upgradeAbilityCallback", {success, abilityName, abilityUpgrade, cooldown, numAvailableUpgrades});
	}
};
