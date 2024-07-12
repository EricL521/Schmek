// logic involved with abilities
const fs  = require("fs");
const path = require("path");

// load abilities
console.log("Loading snake abilities...");
// import all abilities from snake-abilities folder
// structure of folder: abilityName/abilityName.js, along with subfolders, which are subabilities
const snakeAbilitiesPath = path.join(__dirname, "..", "snake-abilities");
const abilityOptions = new Map();
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
		name: dir.name,
		... ability, // has a activate and onmount function
		subabilities: subabilities,
	}
};
// NOTE: processDir adds subabilities
fs.readdirSync(snakeAbilitiesPath, { withFileTypes: true }).map(dir => processDir(snakeAbilitiesPath, dir)).forEach(ability => {
	if (ability) abilityOptions.set(ability.name, ability);
});
// also create an array version to send to clients
// NOTE: THIS VERSION IS ONLY [name, subabilities]
// returns abilitiesArray (used recursively)
const processAbilities = (abilities) => {
	const abilitiesArray = [];
	abilities.forEach((value, key) => {
		abilitiesArray.push([key, processAbilities(value.subabilities)]);
	});
	return abilitiesArray;
};
const abilitieOptionsArray = processAbilities(abilityOptions);

// AbilityManager for Snakes on SERVER
class AbilityManager {
	static get abilityOptions() { return abilityOptions; }
	// this is used to send to client
	static get abilityOptionsArray() { return abilitieOptionsArray; }
	

	constructor() {
		// start with no ability
		// is an array of strings, which describe the ability and subability
		this.abilityPath = [];
		// initialize this.ability
		this.initialize(); 
		this.lastActivation = null; // last time ability was activated
		// cooldown of ability, in seconds
		this.cooldown = 0; // NOTE: updated in ability files 
	}

	// returns subabilities, if there is an ability, or just all abilities
	get subabilities() { return this.ability? this.ability.subabilities?? new Map() : AbilityManager.abilityOptions; }
	// returns if this ability is activateable
	get isActivateable() { return this.ability && this.ability.activate; }
	// add new sub ability
	upgrade(snake, subability) {
		// if subability isn't available, return false
		if (!this.subabilities.has(subability)) return false;

		// otherwise, update ability/abilityPath and reinitialize ability
		this.abilityPath.push(subability);
		this.initialize();
		// also call the ability's onmount function
		if (this.ability.onmount) this.ability.onmount(snake, this);
		return true;
	}
	// initialize the ability
	initialize() {
		let ability = AbilityManager.abilityOptions.get(this.abilityPath[0]);
		for (let i = 1; i < this.abilityPath.length; i++)
			ability = ability.subabilities.get(this.abilityPath[i]);
		this.ability = ability;
	}
	// activates the ability
	activate(game, snake) {
		// make sure this is an activatable ability
		if (!this.isActivateable) return;
		// check cooldown
		if (this.timeSinceLastActivation < this.cooldown) return;

		// call and return output of ability
		const output = this.ability.activate(game, snake);
		if (!output) return;
		// update lastAbilityActivation
		this.lastActivation = new Date();
		return output;
	}
	// get time since last ability activation, in seconds
	get timeSinceLastActivation() {
		if (!this.lastActivation) return Infinity;		
		return (Date.now() - this.lastActivation) / 1000;
	}
}

module.exports = { AbilityManager };
