// logic for making the tail that splits off keep moving in the same direction

const reverseAbility = require("../reverse.js");

module.exports = {
	// no onmount function, because we are keeping the same cooldown
	activate: (game, snake, proportionKept = 0.5) => {
		const output = reverseAbility.activate(game, snake, proportionKept);
		if (!output) return;
		// get tail snake
		const tailSnake = output[2];
		// set initial direction
		tailSnake.currentDirection = tailSnake.head.directionOut;
		tailSnake.setDirection(tailSnake.head.directionOut);
		// revive tail snake
		game.reviveSnake(tailSnake);

		return output;
	}
}