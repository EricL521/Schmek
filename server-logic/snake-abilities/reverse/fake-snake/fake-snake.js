// logic for making the tail that splits off keep moving in the same direction

const reverseAbility = require("../reverse.js");

module.exports = {
	activate: (game, snake, proportionKept = 0.5, cooldown = 5) => {
		const output = reverseAbility.activate(game, snake, proportionKept, cooldown);
		if (!output) return;
		// get tail snake
		const tailSnake = output[2];
		// set initial direction
		tailSnake.currentDirection = tailSnake.head.direction;
		tailSnake.setDirection(tailSnake.head.direction);
		// revive tail snake
		game.reviveSnake(tailSnake);

		return output;
	}
}