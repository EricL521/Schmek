// logic for making the tail that splits off and moves in random directions

const reverseAbility = require("../reverse.js");

const directions = new Set([
	[0, 1],
	[0, -1],
	[1, 0],
	[-1, 0],
].map(dir => dir.join()));

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

		// on update, change direction to random direction
		tailSnake.on("updateHeadBorderRadius", (updating) => {
			if (!updating) return; // only run if we're about to update the head

			const directionsCopy = new Set(directions);
			// remove opposite current direction from directionsCopy (we can't go backwards)
			directionsCopy.delete(tailSnake.currentDirection.map(x => -x).join());
			// randomly choose a direction from directionsCopy
			const directionString = Array.from(directionsCopy)[Math.floor(Math.random() * directionsCopy.size)];
			const direction = directionString.split(",").map(num => parseInt(num));
			
			tailSnake.setDirection(direction);
		});

		return output;
	}
}