const EventEmitter = require("events");

// manages a single ability for CLIENT
class AbilityManager extends EventEmitter {
	constructor (abilityName, cooldown, socket) {
		super();
		
		this.name = abilityName; // name of ability
		// stores the upgrades for ability locally
		// NOTE: this does not actually do anything for server
		this.abilityUpgrades = new Set(); 

		this.cooldown = cooldown?? 0; // cooldown in seconds of ability
		this.lastAbilityUse = new Date(0); // time of last ability use

		this.socket = socket; // socket.io client
	}

	// takes in a string of the next upgrade name
	// returns a Promise of numAvailableUpgrades
	upgradeAbility(abilityUpgrade) {
		if (!abilityUpgrade) return;

		return new Promise((res, rej) => {
			this.socket.emit("upgradeAbility", this.name, abilityUpgrade, (success, _, newCooldown, numAvailableUpgrades) => {
				this.cooldown = newCooldown?? this.cooldown; // update cooldown
				// if succesful, store upgrade and resolve
				if (success) {
					this.abilityUpgrades.add(abilityUpgrade);
					this.emit("abilityUpgrade", numAvailableUpgrades, this.cooldown);
					res(numAvailableUpgrades);
				}
				else rej();
			});
		});
	}
	// returns true if the ability already has the upgrade
	hasUpgrade(abilityUpgrade) {
		return this.name == abilityUpgrade || this.abilityUpgrades.has(abilityUpgrade)
	}

	get onCooldown() {
		return Date.now() - this.lastAbilityUse < this.cooldown * 1000;;
	}
	// returns a Promise of [headPos, direction]
	// rejects if ability failed to activate
	activateAbility() {
		if (this.onCooldown) return Promise.reject();

		return new Promise((res, _) => {
			this.socket.emit("activateAbility", this.name, (success, headPos, direction) => {
				if (success) {
					// callback is only called if ability is activated, so set last ability use to now
					this.lastAbilityUse = new Date(); 
					this.emit("abilityActivated", this.lastAbilityUse);
					res([headPos, direction]);
				}
				else rej();
			});
		});
	}

}

export default AbilityManager;