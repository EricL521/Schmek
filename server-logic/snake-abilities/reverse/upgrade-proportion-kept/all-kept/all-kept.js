// makes it so all of the snake is kept when reversing

const reverseAbility = require('../../reverse.js');

module.exports = {
	// no onmount function, because we are keeping the same cooldown
	activate: (game, snake, proportionKept = 1) => reverseAbility(game, snake, proportionKept)
}