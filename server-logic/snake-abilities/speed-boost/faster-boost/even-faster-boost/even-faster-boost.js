// logic for making the speed boost faster

const speedBoostAbility = require("../../speed-boost.js");

module.exports = {
	// no onmount function, because we are keeping the same cooldown
	activate: (game, snake, speed = 8, length = 10) => speedBoostAbility.activate(game, snake, speed, length)
};
