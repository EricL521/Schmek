// logic for allowing snake to eat dead snakes

module.exports = {
	onmount: (snake, deadSnakeToGrow = 4) => {
		snake.deadSnakeEatenAmount = 0; // initialize counter
		// add custom update function
		snake.customUpdateFunctions.push((_, snake, newHeadTile) => {
			// if new head tile is a dead snake
			if (newHeadTile.type === "snake" && newHeadTile.dead) {
				snake.deadSnakeEatenAmount ++;
				// if we've eaten 3 tiles, grow snake
				if (snake.deadSnakeEatenAmount >= deadSnakeToGrow) {
					snake.emit("grow");
					snake.deadSnakeEatenAmount = 0; // reset counter
					return []; // no tile changes
				}
				// otherwise, update tail
				return snake.updateTail();
			}
		});
	}
};
