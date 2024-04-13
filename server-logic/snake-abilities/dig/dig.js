// logic for the dig ability

// Makes snake dig underground for a few tiles, allowing it to move through other snakes
// however, if you dig into an underground snake, you die
// length is how many updates the speed boost lasts
// and cooldown is how long before the snake can use the ability again
// returns true if it was succesful
module.exports = {
	onmount: (snake, cooldown = 10) => {
		snake.cooldown = cooldown;

		// allow snake to pass through non-underground things if it's underground
		snake.customUpdateFunctions.push((_, snake, newHeadTile) => {
			if (snake.underground && newHeadTile && !newHeadTile.underground) 
				return snake.updateTail();
		});
		// kill snake if it hits an underground snake if it's underground
		snake.customUpdateFunctions.push((_, snake, newHeadTile) => {
			if (snake.underground && newHeadTile && newHeadTile.underground)
				return "kill";
		});
	},
	activate: (_, snake, length = 10) => {
		snake.underground = true; // make snake underground (only used in onmount function)
		let totalUpdates = 0; // how many updates the ability has left
		const headAddListener = (snakeHead) => {
			totalUpdates ++;
			if (totalUpdates > length) {
				snake.off("headAdd", headAddListener);
				snake.underground = false;
			}
			else {
				// change head to underground
				snakeHead.underground = true;
				snakeHead.size = 0.5;
			}
		};
		snake.on("headAdd", headAddListener);

		return true;
	}
};
