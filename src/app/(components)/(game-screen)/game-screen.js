// the actual game!

import { useEffect, useMemo, useReducer } from 'react';

import Board from './(board)/board';
import DeathPopup from './(popups)/death-popup';
import UpgradeAbilityPopup from './(popups)/upgrade-ability-popup';
import AbilityIndicator from './ability-indicator';

import styles from './game-screen.module.css';

export default function GameScreen({ client, tileSize }) {
	// NOTE: most logic is in the components

	// add listener for new client abilities
	const [update, forceUpdate] = useReducer(x => x + 1, 0);
	useEffect(() => {
		// force update of abilityIndicators
		const newAbilityCallback = () => {
			forceUpdate();
		}
		client.on("newAbility", newAbilityCallback);
		
		// on unmount, remove listener
		return () => client.removeListener("newAbility", newAbilityCallback);
	}, [client]);
	const abilityIndicators = useMemo(() => {
		update;

		console.log(client.abilities.size);

		const abilityIndicatorsArray = [];
		let index = 0;
		for (const [_, ability] of client?.abilities) 
			if (ability.cooldown > 0) {// if ability has no cooldown it is assumed to be a passive ability
				abilityIndicatorsArray.push(<AbilityIndicator key={index} index={index} client={client} ability={ability} />);
				index ++;
			}
		// keep one extra for animating new abilities
		abilityIndicatorsArray.push(<AbilityIndicator key={index} index={index} client={client} ability={null} />);
		index ++;
		return abilityIndicatorsArray;
	}, [client, update]);
	return (
		<div id={styles['game-screen']}>
			<Board client={client} tileSize={tileSize} />

			<div id={styles['ability-indicators-div']}>
				{ abilityIndicators }
			</div>

			<DeathPopup client={client} /> 
			<UpgradeAbilityPopup client={client} />
		</div>
	);
};

