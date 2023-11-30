// pops up when you die, and allows you to respawn
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react';
import { unFocus } from '../../unFocus';

import styles from './upgrade-ability-popup.module.css';

// isUpgrade is whether or not this is an upgrade or a new ability
export default function UpgradeAbilityPopup({ client }) {
	// add listeners to client for ability upgrades
	useEffect(() => {
		// add listener for when a snake upgrade is available
		const abilityUpgradeListener = (abilityUpgradeOptions, isUpgrade, _) => {
			setAbilityUpgradeOptions(abilityUpgradeOptions);
			setIsUpgrade(isUpgrade);
		};
		client.on("abilityUpgrade", abilityUpgradeListener);

		// return function to remove listeners
		return () => client.removeListener("abilityUpgrade", abilityUpgradeListener);
	}, [client]);
	// store ability upgrade data
	const [abilityUpgradeOptions, setAbilityUpgradeOptions] = useState(client?.abilityUpgrades);
	const [isUpgrade, setIsUpgrade] = useState(false);

	const onButtonClick = useCallback((abilityName) => {
		unFocus(); // if you click with mouse
		client.upgradeAbility(abilityName);
	}, [client]);

	// add listener for when keybind is updated, and store whether it has
	const [keybindsChanged, setKeybindsChanged] = useState(false);
	useEffect(() => {
		const keybindListener = () => {
			setKeybindsChanged(true);
		};
		client.on("controlsChange", keybindListener);

		return () => client.removeListener("controlsChange", keybindListener);
	}, [client]);
	// get keybinds for upgrading keybinds
	// if upgradeKeybinds are passed in, only gets new keybinds from having more options
	// otherwise, starts from scratch and gets all keybinds
	const getKeybinds = useCallback((upgradeKeybinds) => {
		const keybinds = upgradeKeybinds?? [];
		// only get keybinds up to the amount of ability options
		for (let i = keybinds.length; i < abilityUpgradeOptions?.length; i ++) 
			keybinds.push(client?.reverseControls.get("selectAbilityUpgrade" + (i + 1)).values().next().value);

		return keybinds;
	}, [client, abilityUpgradeOptions]);
	// store keybinds
	const [upgradeKeybinds, setUpgradeKeybinds] = useState(getKeybinds());
	// this just updates keybindsChanged as well
	const updateKeybinds = useCallback((keybinds) => {
		setKeybindsChanged(false);
		setUpgradeKeybinds(keybinds);
	}, []);
	// update keybinds if necessary
	useMemo(() => {
		if (keybindsChanged) return updateKeybinds(getKeybinds());
		if (abilityUpgradeOptions && abilityUpgradeOptions.length > upgradeKeybinds.length)
			return updateKeybinds(getKeybinds(upgradeKeybinds));
	// NOTE: this changes upgradekeybinds, so it isn't a dependnecy
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [abilityUpgradeOptions, keybindsChanged, getKeybinds, updateKeybinds]);

	return (
		<div id={styles['centerer-div']} className={abilityUpgradeOptions != null? '' : styles['hidden']}>
			<div className={styles['interactive']} id={styles['upgrade-ability-popup']}>
				<h2 className={styles['interactive']}>{isUpgrade? "Upgrade ability" : "Pick an ability"}</h2>
				<div id={styles['abilities-list']}>
					{abilityUpgradeOptions?.map((option, index) => (
						<button key={option} className={styles['interactive']} onClick={() => onButtonClick(option)}>
							{upgradeKeybinds[index]? `[${upgradeKeybinds[index]}] `: ""}{option.replaceAll('-', ' ')}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};
