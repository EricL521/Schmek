// logic for the speed boost ability

const { tps } = require("../../game-config.json");

// gives snake a speed boost over next couple seconds
// speed is how many times faster snake will move
// length is how many updates the speed boost lasts
// and cooldown is how long before the snake can use the ability again
// returns true if it was succesful
module.exports = {
	onmount: (_, abilityManager, cooldown = 10) => {
		abilityManager.cooldown = cooldown;
	},
	activate: (game, snake, speed = 2, length = 10) => {
		// if the speed is not any faster, don't do anything
		if (speed <= 1) return;

		// increase snake speed variable
		snake.speed = speed;

		let totalUpdates = length;
		let interval = null;
		let updatesSinceGameUpdate = 0;
		// add listener for snake update
		const updateListener = () => {
			// check if totalUpdates is 0
			if (totalUpdates-- <= 0) {
				// clear interval and listener and reset snake speed
				clearInterval(interval);
				snake.speed = 1;
				return snake.off("updateHead", updateListener);
			}
			
			// if there is no interval, create one
			interval = interval ?? setInterval(() => {
				// update snake and update board and players
				const tileChanges = game.updateSnake(snake);
				game.updateBoard(tileChanges); game.updatePlayers(tileChanges);
				
				// if a game update is about to happen, stop the interval
				if (++ updatesSinceGameUpdate >= speed - 1) {
					updatesSinceGameUpdate = 0;
					clearInterval(interval);
					interval = null;
				}
			}, 1000 / tps / speed);
		};
		snake.on("updateHead", updateListener);

		// return true to signify that the ability was activated
		return true;
	}
};
