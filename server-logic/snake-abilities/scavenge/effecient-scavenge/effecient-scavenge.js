// logic for making snake more efficient at scavenging

const scavengerAbility = require("../scavenge.js");

module.exports = {
	onmount: (snake) => {
		// remove old custom update function
		snake.customUpdateFunctions.splice(0, 1);
		// add new custom update function
		scavengerAbility.onmount(snake, 3);
	}
};
