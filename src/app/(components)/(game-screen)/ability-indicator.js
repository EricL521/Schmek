// shows ability and ability cooldown

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { unFocus } from '../unFocus';

import styles from './ability-indicator.module.css';

export default function AbilityIndicator({ client }) {
	// add listeners for client events
	useEffect(() => {
		// add listener for when a snake upgrade is available
		const abilityUpgradeListener = (_0, _1, cooldown) => {
			if (typeof cooldown === "number") setCooldown(cooldown);
		};
		client.on("abilityUpgrade", abilityUpgradeListener);

		// add listener for when ability is activated
		const abilityActivatedListener = (lastAbilityUse, _) => {
			setLastAbilityUse(lastAbilityUse);
		};
		client.on("abilityActivated", abilityActivatedListener);

		// return function to remove listeners
		return () => {
			client.removeListener("abilityUpgrade", abilityUpgradeListener);
			client.removeListener("abilityActivated", abilityActivatedListener);
		};
	}, [client]);
	// store ability cooldown and last ability use
	const [cooldown, setCooldown] = useState(client?.cooldown);
	const [lastAbilityUse, setLastAbilityUse] = useState(client?.lastAbilityUse);

	// html object of animation element
	const animateRef = useRef(null);

	const timeSinceLastAbilityUse = (Date.now() - lastAbilityUse) / 1000;
	const remainingCooldown = Math.max(0, cooldown - timeSinceLastAbilityUse);
	const animationProportion = remainingCooldown / cooldown;
	// restart animation, AFTER render
	useEffect(() => animateRef.current?.beginElement());

	const [, forceUpdate] = useReducer(x => x + 1, 0);
	// set timeout for when cooldown is over to force update
	useEffect(() => {
		const timeout = setTimeout(forceUpdate, remainingCooldown * 1000);
		// clear timeout on re-render
		return () => clearTimeout(timeout);
	}, [remainingCooldown]);

	// get keybind for activating ability
	const [abilityKeybind, setAbilityKeybind] = useState(client?.reverseControls.get("activateAbility").values().next().value);
	// add listener for when keybind is updated
	useEffect(() => {
		const keybindListener = () => {
			setAbilityKeybind(client.reverseControls.get("activateAbility").values().next().value);
		};
		client.on("controlsChange", keybindListener);

		return () => client.removeListener("controlsChange", keybindListener);
	}, [client]);

	// create function for activating button
	const activateAbility = useCallback(() => {
		unFocus();
		client.keyPress(abilityKeybind);
	}, [client, abilityKeybind]);

	return (
		<div id={styles['positioning-div']} className={cooldown > 0? '' : styles['hidden']}>
			<div id={styles['ability-indicator']}>
				{/* Copied from https://stackoverflow.com/questions/26178095/svg-circle-animation */}
				<svg id={styles['svg']} className={[styles['interactive'], cooldown > 0 && remainingCooldown <= 0? styles['active']: ''].join(' ')} 
				version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
				x="0px" y="0px" viewBox="0 0 34 34" xmlSpace="preserve">
					<circle id={styles['circle']} className={cooldown > 0 && remainingCooldown <= 0? styles['active']: ''} 
					strokeWidth={2} cx={17} cy={17} r={16} strokeDasharray={32 * Math.PI} strokeLinecap="round">
						{(remainingCooldown > 0)?
							<animate ref={animateRef} attributeName="stroke-dashoffset" begin={"indefinite"} 
								from={32 * Math.PI * animationProportion} to={0} dur={remainingCooldown}>
							</animate>
						: null}
					</circle>
				</svg>

				<button id={styles['activate-ability-button']} className={[styles['interactive'], 
				cooldown > 0 && remainingCooldown <= 0? styles['active']: ''].join(' ')} onClick={activateAbility}>
					[{abilityKeybind == " " ? "Space" : abilityKeybind}] Activate Ability
				</button>
			</div>
		</div>
	);
};

