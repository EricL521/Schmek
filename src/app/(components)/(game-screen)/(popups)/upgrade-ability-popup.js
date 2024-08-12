// pops up when you die, and allows you to respawn
'use client'

import { useCallback, useEffect, useState, useMemo, useReducer } from 'react';
import { unFocus } from '../../unFocus';

import styles from './upgrade-ability-popup.module.css';

// overrides are for subability viewing
// abilityName is the name of the main ability when viewing subabilities
// no value means that main ability is assumed
export default function UpgradeAbilityPopup({ client, isUpgrade = false, hiddenOverride, abilityOptionsOverride, 
												parentDivOverrideId, abilityName}) {
	// store ability upgrade data
	// theoretically ability options should never change
	const [abilityOptions, _] = useState(abilityOptionsOverride?? client?.abilityOptions);
	const [numAvailableUpgrades, setNumAvailableUpgrades] = useState(0);
	const [hiddenOverrides, hiddenOverridesDispatch] = useReducer((state, action) => {
		if (action.reset == true) return new Map(abilityOptions?.map(([name, _]) => [name, true]));

		const newState = new Map(state);
		newState.set(action.name, action.value);
		return newState;
	}, new Map(abilityOptions?.map(([name, _]) => [name, true]))); 
	
	// add listeners to client for ability upgrades and keybinds
	useEffect(() => {
		if (hiddenOverride) return; // no listeners if popup is being manually hidden

		const abilityUpgradeListener = (numAvailableUpgrades) => {
			setNumAvailableUpgrades(numAvailableUpgrades);
			// reset hiddenOverrides
			hiddenOverridesDispatch({reset: true});
		};
		client.on("abilityUpgrade", abilityUpgradeListener);

		const openUpgradeListener = (abilityUpgrade) => {
			console.log(abilityUpgrade, "open upgrade");
			hiddenOverridesDispatch({name: abilityUpgrade, value: false});
		};
		client.on("openUpgrade", openUpgradeListener)

		// listener for when ability upgrade keybind is clicked
		const selectAbilityListener = (index) => {
			if (index >= abilityOptions.length) return;
			// get name of ability upgrade
			const abilityName = abilityOptions[index][0];
			onButtonClick(abilityName);
		};
		// only listen for selecting abilities if no sub abilities are open
		if (Array.from(hiddenOverrides.values()).every(hidden => hidden)) client.on("selectAbility", selectAbilityListener);

		// return function to remove listeners
		return () => {
			client.removeListener("abilityUpgrade", abilityUpgradeListener);
			client.removeListener("selectAbility", selectAbilityListener);
		};
	}, [client, hiddenOverrides, hiddenOverride, isUpgrade]);

	const onButtonClick = useCallback((abilityUpgrade) => {
		unFocus(); // if you click with mouse
		// NOTE: all callback logic is handled in listeners
		client.upgradeAbility(abilityName?? abilityUpgrade, abilityUpgrade)
	}, [abilityName, client]);
	
	// just a helper function to capitalize strings
	const capitalize = useCallback((str) => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}, []);
	const getKeybindLabel = useCallback((index) => {
		return `[${client?.reverseControls.get("selectAbilityUpgrade" + (index + 1))?.values()?.next().value}]`;
	}, [client]);
	const abilityOptionButtons = useMemo(() => {
		return abilityOptions.map(([name, _], index) => (
			<button key={name} className={styles['interactive']} onClick={() => onButtonClick(name)}>
				{`${getKeybindLabel(index)?? ""} ${name.replaceAll('-', ' ')}`}
			</button>
		));
	}, [abilityOptions]);
	const subabilityPopups = useMemo(() => {
		// NOTE: abilityOptions already accounts for abilityOption overrides
		return abilityOptions.map(([name, subabilities], index) => (
			<UpgradeAbilityPopup key={index} client={client} isUpgrade={true} hiddenOverride={hiddenOverrides.get(name)} 
				abilityOptionsOverride={subabilities} parentDivOverrideId={'upgrade-div'} 
				abilityName={abilityName?? name}/>
		));
	}, [abilityOptions, hiddenOverrides]);
	return (
		<div id={styles[parentDivOverrideId]?? ''}
		className={[styles['centerer-div'], (typeof hiddenOverride != typeof undefined && !hiddenOverride) 
		|| (typeof hiddenOverride == typeof undefined && numAvailableUpgrades > 0)? '' : styles['hidden']].join(' ')}>
			<div className={styles['interactive']} id={styles['upgrade-ability-popup']}>
				<h2 className={styles['interactive']}>
					{isUpgrade? `${abilityName? capitalize(abilityName).replaceAll('-', ' '): 'Ability'} upgrades` 
						: "Pick an ability"}
				</h2>
				<div id={styles['abilities-list']}>
					{ abilityOptionButtons }
				</div>
			</div>
			<div id={styles['sub-abilities']}>
				{ subabilityPopups }
			</div>
		</div>
	);
};
