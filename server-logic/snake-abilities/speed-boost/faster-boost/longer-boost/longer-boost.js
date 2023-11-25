// logic for making the speed boost even longer

const speedBoostAbility = require("../../speed-boost.js");

module.exports = {
	// no onmount function, because we are keeping the same cooldown
	activate: (game, snake, speed = 4, length = 15) => speedBoostAbility.activate(game, snake, speed, length)
};
