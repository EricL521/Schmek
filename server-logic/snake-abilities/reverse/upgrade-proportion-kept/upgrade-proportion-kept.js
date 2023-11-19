// makes it so more of the snake is kept when reversing

const reverseAbility = require('../reverse.js');

module.exports = {
	activate: (game, snake, proportionKept = 0.75) => reverseAbility.activate(game, snake, proportionKept)
}