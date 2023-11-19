// logic for making the speed boost faster

const speedBoostAbility = require("../../speed-boost.js");

module.exports = {
	activate: (game, snake, speed = 8, length = 10, cooldown = 10) => speedBoostAbility.activate(game, snake, speed, length, cooldown)
};
