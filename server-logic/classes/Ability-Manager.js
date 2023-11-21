// logic involved with abilities
const fs  = require("fs");
const path = require("path");
const EventEmitter = require("events");

// load abilities
console.log("Loading snake abilities...");
// import all abilities from snake-abilities folder
// structure of folder: abilityName/abilityName.js, along with subfolders, which are subabilities
const snakeAbilitiesPath = path.join(__dirname, "..", "snake-abilities");
const abilities = new Map();
const processDir = (dirPath, dir) => {
	// if not a directory, skip
	if (!dir.isDirectory()) return;

	// get ability
	const ability = require(path.join(dirPath, dir.name, `${dir.name}.js`));
	// get subabilities
	const subabilities = new Map();
	const subPath = path.join(dirPath, dir.name);
	fs.readdirSync(subPath, { withFileTypes: true }).map(dir => processDir(subPath, dir)).forEach(subability => {
		if (subability) subabilities.set(subability.name, subability);
	});

	// return ability
	return {
		// turn name into camel case
		name: dir.name.split("-").map((word, index) => index > 0? word[0].toUpperCase() + word.slice(1): word).join(""),
		... ability, // has a activate and onmount function
		subabilities: subabilities,
	}
};
fs.readdirSync(snakeAbilitiesPath, { withFileTypes: true }).map(dir => processDir(snakeAbilitiesPath, dir)).forEach(ability => {
	if (ability) abilities.set(ability.name, ability);
});

// Snake extends this class
class AbilityManager extends EventEmitter {
	constructor() {
		super();

		// start with no ability
		// is an array of strings, which describe the ability and subability
		this.abilityPath = [];
		this.initializeAbility(); // initialize this.ability
		this.lastAbilityActivation = null; // last time ability was activated
	}

	// add new ability to snake
	upgradeAbility(subability) {
		this.emit("upgradeAbility", subability);
		this.abilityPath.push(subability);
		this.initializeAbility();
		// also call the ability's onmount function
		if (this.ability.onmount) this.ability.onmount(this);
	}
	// initialize the ability
	initializeAbility() {
		let ability = abilities.get(this.abilityPath[0]);
		for (let i = 1; i < this.abilityPath.length; i++)
			ability = ability.subabilities.get(this.abilityPath[i]);
		this.ability = ability;
	}
	// activates the snake's ability
	activateAbility(game) {
		// make sure snake is alive and has an activatable ability
		if (!this.alive || !this.ability || !this.ability.activate) return;

		this.emit("activateAbility");
		// call and return output of ability
		const output = this.ability.activate(game, this);
		if (!output) return;
		// update lastAbilityActivation
		this.lastAbilityActivation = new Date();
		return output;
	}
	// get time since last ability activation, in seconds
	get timeSinceLastAbilityActivation() {
		if (!this.lastAbilityActivation) return Infinity;		
		return (Date.now() - this.lastAbilityActivation) / 1000;
	}
}

module.exports = { AbilityManager };
