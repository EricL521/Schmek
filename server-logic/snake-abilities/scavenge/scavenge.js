// logic for allowing snake to eat dead snakes
// also makes eating apples half as effective

module.exports = {
	onmount: (snake, deadSnakeToGrow = 4, appleToGrow = 2) => {
		snake.deadSnakeEatenAmount = 0; // initialize counter
		// add custom update function for eating dead snakes
		snake.customUpdateFunctions.push((_, snake, newHeadTile) => {
			// if new head tile is a dead snake
			if (newHeadTile.type === "snake" && newHeadTile && newHeadTile.dead) {
				snake.deadSnakeEatenAmount ++;
				// if we've eaten 3 tiles, grow snake
				if (snake.deadSnakeEatenAmount >= deadSnakeToGrow) {
					snake.deadSnakeEatenAmount = 0; // reset counter
					
					snake.emit("grow");
					return []; // no tile changes
				}
				// otherwise, update tail
				return snake.updateTail();
			}
		});

		snake.appleEatenAmount = 0; // initialize counter
		// add custom update function for eating apples
		snake.customUpdateFunctions.push((game, snake, newHeadTile) => { 
			if (newHeadTile.type === "food") { 
				snake.appleEatenAmount ++;
				if (snake.appleEatenAmount >= appleToGrow) {
					snake.appleEatenAmount = 0; // reset counter

					const tileChanges = [];
					snake.emit("grow"); // used in abilityManager to determine giving abilities
					tileChanges.push(...game.generateFood()); // generate new food
					return tileChanges;
				}
			}
		});
	}
};
