import { EventEmitter } from 'events';

// manages a single ability for CLIENT
class AbilityManager extends EventEmitter {
	constructor (abilityName, cooldown, channel) {
		super();
		
		this.name = abilityName; // name of ability
		// stores the upgrades for ability locally
		// NOTE: this does not actually do anything for server
		this.abilityUpgrades = new Set(); 

		this.cooldown = cooldown?? 0; // cooldown in seconds of ability
		this.lastAbilityUse = new Date(0); // time of last ability use

		this.channel = channel; // geckos.io client
	}

	// takes in a string of the next upgrade name
	upgradeAbility(abilityUpgrade) {
		if (!abilityUpgrade) return;

		this.channel.emit("upgradeAbility", {abilityName: this.name, abilityUpgrade}); 
	}
	// called from client class when server responds
	upgradeAbilityCallback(abilityUpgrade, newCooldown, numAvailableUpgrades) {
		this.cooldown = newCooldown?? this.cooldown; // update cooldown

		this.abilityUpgrades.add(abilityUpgrade);
		this.emit("abilityUpgrade", numAvailableUpgrades, this.cooldown);
	}
	// returns true if the ability already has the upgrade
	hasUpgrade(abilityUpgrade) {
		return this.name == abilityUpgrade || this.abilityUpgrades.has(abilityUpgrade)
	}

	get onCooldown() {
		return Date.now() - this.lastAbilityUse < this.cooldown * 1000;;
	}
	// activates ability if not on cooldown
	activateAbility() {
		if (this.onCooldown) return;

		this.channel.emit("activateAbility", {abilityName: this.name});
	}
	activateAbilityCallback() {
		// callback is only called if ability is activated, so set last ability use to now
		this.lastAbilityUse = new Date(); 
		this.emit("abilityActivated", this.lastAbilityUse);
	}

}

export default AbilityManager;