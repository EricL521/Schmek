// pops up when you die, and allows you to respawn
'use client'

import { unFocus } from '../../unFocus';

import styles from './upgrade-ability-popup.module.css';

// isUpgrade is whether or not this is an upgrade or a new ability
export default function UpgradeAbilityPopup({ options, show, isUpgrade, upgradeAbility }) {
	const onButtonClick = (abilityName) => {
		unFocus(); // if you click with mouse
		upgradeAbility(abilityName);
	};

	return (
		<div id={styles['centerer-div']} className={show? '' : styles['hidden']}>
			<div className={styles['interactive']} id={styles['upgrade-ability-popup']}>
				<h2 className={styles['interactive']}>{isUpgrade? "Upgrade ability" : "Pick an ability"}</h2>
				<div id={styles['abilities-list']}>
					{options?.map((option) => (
						<button key={option} className={styles['interactive']} onClick={() => onButtonClick(option)}>
							{option.replaceAll('-', ' ')}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};
