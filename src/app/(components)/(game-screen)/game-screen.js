// the actual game!

import Board from './(board)/board';
import styles from './game-screen.module.css';
import DeathPopup from './(popups)/death-popup';
import UpgradeAbilityPopup from './(popups)/upgrade-ability-popup';
import AbilityIndicator from './ability-indicator';

export default function GameScreen({ client, tileSize }) {
	// NOTE: all logic is in the components

	return (
		<div id={styles['game-screen']}>
			<Board client={client} tileSize={tileSize}/>

			<AbilityIndicator client={client}/>

			<DeathPopup client={client}/> 
			<UpgradeAbilityPopup client={client}/>
		</div>
	);
};

