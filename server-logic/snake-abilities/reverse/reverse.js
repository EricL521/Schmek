// logic for the reverse ability

// reverses entire snake, and kills part of the new tail
// cooldown is in seconds
// returns [tileChanges, [newHeadPos, newDirection]]
module.exports = {
	activate: (game, snake, proportionKept = 0.5, cooldown = 5) => {
		// check cooldown
		if (snake.timeSinceLastAbilityActivation < cooldown) return;
		// make sure snake length is 4 or greater
		if (snake.body.length < 4) return;

		// keep track of changed Tiles
		const tileChanges = [];

		// kill part of the current head, and would be tail
		const amountKilled = Math.floor(snake.body.length * (1 - proportionKept));
		let deadSnake = null;
		if (amountKilled > 0) {
			const tail = snake.body.splice(snake.body.length - amountKilled, amountKilled);
			// create new dead snake
			deadSnake = game.addDeadSnake(null, snake.name, snake.color, tail, false);
		}

		// reverse body
		snake.body.reverse();

		// set current direction and newDirection to the direction of the new head
		snake.currentDirection = snake.body[snake.body.length - 2].direction.map(x => -x);
		snake.setDirection(snake.head.direction.map(x => -x));

		// reverse direction of each Tile
		for (let i = snake.body.length - 1; i >= 1; i--)
			snake.body[i].direction = snake.body[i - 1].direction.map(x => -x);
		snake.body[0].direction = snake.body[0].direction.map(x => -x);

		// update tail and head corners
		tileChanges.push(...snake.updateTailBorderRadius());
		tileChanges.push(...snake.updateHeadBorderRadius(false));

		return [tileChanges, [snake.head.position, snake.newDirection], deadSnake];
	}
};
