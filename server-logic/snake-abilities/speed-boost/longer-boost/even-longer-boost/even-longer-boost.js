// logic for making the speed boost even longer

const speedBoostAbility = require("../../speed-boost.js");

module.exports = {
	activate: (game, snake, speed = 2, length = 20, cooldown = 10) => speedBoostAbility.activate(game, snake, speed, length, cooldown)
};
