// logic for getting tail snake to move in random direction

const fakeSnakeAbility = require("../fake-snake.js");

const directions = new Set([
	[0, 1],
	[0, -1],
	[1, 0],
	[-1, 0],
].map(dir => dir.join()));

module.exports = {
	// no onmount function, because we are keeping the same cooldown
	activate: (game, snake, proportionKept = 0.5) => {
		const output = fakeSnakeAbility.activate(game, snake, proportionKept);
		if (!output) return;

		// get tail snake
		const tailSnake = output[2];
		// NOTE: update for updateheadborderadius because it creates the curve when turning
		tailSnake.on("updateHeadBorderRadius", () => {
			const directionsCopy = new Set(directions);
			// remove current direction from directionsCopy
			directionsCopy.delete(tailSnake.head.direction.join());
			// randomly choose a direction from directionsCopy
			const directionString = Array.from(directionsCopy)[Math.floor(Math.random() * directionsCopy.size)];
			const direction = directionString.split(",").map(num => parseInt(num));
			
			tailSnake.setDirection(direction);
		});

		return output;
	}
};