// makes it so all of the snake is kept when reversing

const reverseAbility = require('../../reverse.js');

module.exports = {
	activate: (game, snake, proportionKept = 1) => reverseAbility(game, snake, proportionKept)
}