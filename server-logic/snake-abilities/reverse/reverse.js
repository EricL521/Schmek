// logic for the reverse ability

// reverses entire snake, and kills part of the new tail
// cooldown is in seconds
// returns [tileChanges, [newHeadPos, newDirection]]
module.exports = {
	onmount: (snake, cooldown = 5) => {
		snake.cooldown = cooldown;
	},
	activate: (game, snake, proportionKept = 0.5) => {
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
		// flip directionIn and directionOut of each Tile
		for (const tile of snake.body) 
			[tile.directionIn, tile.directionOut] = [tile.directionOut.map(x => -x), tile.directionIn.map(x => -x)]

		// set current direction and newDirection to the direction of the new head
		snake.currentDirection = snake.head.directionIn;
		snake.setDirection(snake.head.directionOut);

		// update tail and head corners
		tileChanges.push(...snake.updateTailBorderRadius());
		tileChanges.push(...snake.updateHeadBorderRadius(false));

		return [tileChanges, [snake.head.position, snake.newDirection], deadSnake];
	}
};
