// shows ability and ability cooldown

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { unFocus } from '../unFocus';

import styles from './ability-indicator.module.css';

export default function AbilityIndicator({ index, client, ability }) {
	// store ability cooldown and last ability use
	const [cooldown, setCooldown] = useState(ability?.cooldown);
	const [lastAbilityUse, setLastAbilityUse] = useState(ability?.lastAbilityUse);

	// add listeners for ability events
	useEffect(() => {
		if (!ability) return; // can only add listeners if ability exists

		// add listener for when a snake upgrade is available
		const abilityUpgradeListener = (_, cooldown) => {
			if (typeof cooldown === "number") setCooldown(cooldown);
		};
		ability.on("abilityUpgrade", abilityUpgradeListener);

		// add listener for when ability is activated
		const abilityActivatedListener = (lastAbilityUse) => {
			setLastAbilityUse(lastAbilityUse);
		};
		ability.on("abilityActivated", abilityActivatedListener);

		// return function to remove listeners
		return () => {
			ability.removeListener("abilityUpgrade", abilityUpgradeListener);
			ability.removeListener("abilityActivated", abilityActivatedListener);
		};
	}, [ability]);
	// update cooldown and lastAbilityUse when ability changes
	useMemo(() => {
		if (!ability) return; // can only update if ability exists

		if (cooldown != ability.cooldown) setCooldown(ability.cooldown);
		if (lastAbilityUse != ability.lastAbilityUse) setLastAbilityUse(ability.lastAbilityUse);
	}, [ability]);

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
	const [abilityKeybind, setAbilityKeybind] = useState(client?.reverseControls.get(`activateAbility${index + 1}`)?.values().next().value);
	// add listener for when keybind is updated
	useEffect(() => {
		const keybindListener = () => {
			setAbilityKeybind(client.reverseControls.get(`activateAbility${index + 1}`)?.values().next().value);
		};
		client.on("controlsChange", keybindListener);

		return () => client.removeListener("controlsChange", keybindListener);
	}, [client]);

	// create function for activating button
	const activateAbility = useCallback(() => {
		unFocus();
		client.activateAbility(ability?.name);
	}, [client, ability]);

	return (
		<div id={styles['animation-div']} className={[ability? '': styles['hidden'],
		cooldown > 0 && remainingCooldown <= 0? styles['active']: ''].join(' ')}>
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
					[{abilityKeybind == " " ? "Space" : abilityKeybind}] 
					{' ' + ability?.name.replaceAll('-', ' ')}
				</button>
			</div>
		</div>
	);
};

