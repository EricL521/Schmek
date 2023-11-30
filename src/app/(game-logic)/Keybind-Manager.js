import { EventEmitter } from 'events';

// logic for changing and activating keybinds
class KeybindManager extends EventEmitter {
	// map of actions to argument arrays, where first element is the name of the event
	static get actions() {return new Map([
		["joinGame", ["joinGame"]],
		["moveUp", ["direction", [0, -1]]],
		["moveDown", ["direction", [0, 1]]],
		["moveLeft", ["direction", [-1, 0]]],
		["moveRight", ["direction", [1, 0]]],
		["activateAbility", ["activateAbility"]]
	]);}
	// maps key names to actions
	static get defaultControls() {return new Map([
		["Enter", new Set(["joinGame"])],
		["ArrowUp", new Set(["moveUp"])],
		["ArrowDown", new Set(["moveDown"])],
		["ArrowLeft", new Set(["moveLeft"])],
		["ArrowRight", new Set(["moveRight"])],
		["w", new Set(["moveUp"])],
		["s", new Set(["moveDown"])],
		["a", new Set(["moveLeft"])],
		["d", new Set(["moveRight"])],
		[" ", new Set(["activateAbility"])],
	]);}
	// also make the above non-static
	get actions() {return KeybindManager.actions;}
	get defaultControls() {return KeybindManager.defaultControls;}


	// BEGINNING OF INSTANCE CODE
	constructor(controls) {
		super();

		// if controls are passed in, use those
		if (controls) {
			this.controls = controls;
			this.controlsArray = this.genControlsArray();
			this.reverseControls = this.genReverseControlsMap();
		}
		else {
			// check local storage for controls
			const storedControlsArray = localStorage.getItem('controlsArray');
			if (storedControlsArray) {
				this.controlsArray = JSON.parse(storedControlsArray);
				this.controls = this.genControlsMap(); 
				this.reverseControls = this.genReverseControlsMap();
			}
			// otherwise use default controls'
			else {
				this.controls = KeybindManager.defaultControls;
				this.controlsArray = this.genControlsArray();
				this.reverseControls = this.genReverseControlsMap();
			}
		}
	}

	genControlsArray() {
		const controlsArray = [];
		for (const [key, actions] of this.controls) {
			for (const action of actions) {
				controlsArray.push([key, action]);
			}
		}
		return controlsArray;
	}
	genControlsMap() {
		const controls = new Map();
		for (const [key, action] of this.controlsArray) {
			const actions = controls.get(key);
			if (actions) actions.add(action);
			else controls.set(key, new Set([action]));
		}
		return controls;
	}
	genReverseControlsMap() {
		// reverses controls, goes from actions -> controls
		const reverseControls = new Map();
		for (const [key, action] of this.controlsArray) {
			const controls = reverseControls.get(action);
			if (controls) controls.add(key);
			else reverseControls.set(action, new Set([key]));
		}
		return reverseControls;
	}
	// changes the keybind at index of controlsArray to the new key and action
	setKeybind(index, key, action) {
		// remove old action from controls and reverseControls
		const oldKey = this.controlsArray[index][0];
		const oldAction = this.controlsArray[index][1];
		if (oldKey == key && oldAction == action) return; // don't do anything if keybind is the same
		const oldActions = this.controls.get(oldKey);
		if (oldActions) {
			oldActions.delete(oldAction);
			if (oldKey !== key && oldActions.size == 0) this.controls.delete(oldKey);
		}
		const oldControls = this.reverseControls.get(oldAction);
		if (oldControls) {
			oldControls.delete(oldKey);
			if (oldAction !== action && oldControls.size == 0) this.reverseControls.delete(oldKey);
		}

		// update controls
		const actions = this.controls.get(key);
		// if action already is there, set action to "" instead
		if (actions && actions.has(action)) action = "";
		if (actions) actions.add(action);
		else this.controls.set(key, new Set([action]));
		// update controlsArray
		this.controlsArray[index] = [key, action];
		// update reverseControls
		const controls = this.reverseControls.get(action);
		if (controls) controls.add(key);
		else this.reverseControls.set(action, new Set([key]));
		
		// emit event to update local storage
		this.emit("controlsChange");
	}
	addKeybind(key, action) {
		// update controls
		const actions = this.controls.get(key);
		if (actions) actions.add(action);
		else this.controls.set(key, new Set([action]));
		// update controlsArray
		this.controlsArray.unshift([key, action]);
		// update reverseControls
		const controls = this.reverseControls.get(action);
		if (controls) controls.add(key);
		else this.reverseControls.set(action, new Set([key]));
		
		// emit event to update local storage
		this.emit("controlsChange");
	}
	removeKeybind(index) {
		const key = this.controlsArray[index][0];
		const action = this.controlsArray[index][1];
		// remove action from controls
		const actions = this.controls.get(key);
		if (actions) {
			actions.delete(action);
			if (actions.size == 0) this.controls.delete(key);
		}
		// remove key from reverseControls
		const controls = this.reverseControls.get(action);
		if (controls) {
			controls.delete(key);
			if (controls.size == 0) this.reverseControls.delete(action);
		}
		// update controlsArray
		this.controlsArray.splice(index, 1);

		// emit event to update local storage
		this.emit("controlsChange");
	}
	sortKeybinds() {
		// genControlsArray is already sorted
		this.controlsArray = this.genControlsArray();
	}
	// overrides all keybinds with default keybinds
	resetKeybinds() {
		// reset controls reverseControls and controlsArray
		this.controls = KeybindManager.defaultControls;
		this.reverseControls = this.genReverseControlsMap();
		this.controlsArray = this.genControlsArray();

		// emit event to update local storage
		this.emit("controlsChange");
	}
	// called when user presses a key, and emits necessary events
	keyPress(key) {
		const actions = this.controls.get(key);
		if (!actions) return;

		for (const action of actions) {
			const directions = KeybindManager.actions.get(action);
			if (directions) this.emit(directions[0], ...directions.slice(1));
		}
	}
}

export default KeybindManager;
