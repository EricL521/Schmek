// pops up when you die, and allows you to respawn
'use client'

import { useCallback, useEffect, useState } from 'react';
import { unFocus } from '../../unFocus';

import styles from './upgrade-ability-popup.module.css';

// isUpgrade is whether or not this is an upgrade or a new ability
export default function UpgradeAbilityPopup({ client }) {
	// add listeners for client events
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
	const [abilityUpgradeOptions, setAbilityUpgradeOptions] = useState(null);
	const [isUpgrade, setIsUpgrade] = useState(false);

	const onButtonClick = useCallback((abilityName) => {
		unFocus(); // if you click with mouse
		client.upgradeAbility(abilityName);
	}, [client]);

	return (
		<div id={styles['centerer-div']} className={abilityUpgradeOptions != null? '' : styles['hidden']}>
			<div className={styles['interactive']} id={styles['upgrade-ability-popup']}>
				<h2 className={styles['interactive']}>{isUpgrade? "Upgrade ability" : "Pick an ability"}</h2>
				<div id={styles['abilities-list']}>
					{abilityUpgradeOptions?.map((option) => (
						<button key={option} className={styles['interactive']} onClick={() => onButtonClick(option)}>
							{option.replaceAll('-', ' ')}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};
