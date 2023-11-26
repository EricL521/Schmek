// the actual game!

import { useCallback, useEffect, useMemo, useState } from 'react';

import Board from './(board)/board';
import styles from './game-screen.module.css';
import DeathPopup from './(popups)/death-popup';
import UpgradeAbilityPopup from './(popups)/upgrade-ability-popup';
import AbilityIndicator from './ability-indicator';

export default function GameScreen({ client, tileSize }) {
	const respawn = useCallback(() => {
		// add listeners for when board is updated and client respawns
		client.once("initialState", (boardState, headPos) => {
			setBoardState(boardState);
			setHeadPos(headPos);
		});
		client.once("boardInitialized", () => setDead(false));

		// respawn
		client.joinGame();
	}, [client]);

	// add listeners for client events
	useEffect(() => {
		// add listener for when board is updated
		const gameUpdateListener = (boardState, headPos) => {
			if (boardState) setBoardState([... boardState]);
			if (headPos) setHeadPos([... headPos]);
		};
		client.on("gameUpdate", gameUpdateListener);

		// add listener for when snake dies
		const deathListener = (data) => {
			setDead(true);
			setDeathData(data);
		};
		client.on("death", deathListener);

		// add listener for respawning
		client.on("joinGame", respawn);

		// add listener for when a snake upgrade is available
		const abilityUpgradeListener = (abilityUpgradeOptions, isUpgrade, cooldown) => {
			setAbilityUpgradeOptions(abilityUpgradeOptions);
			setIsUpgrade(isUpgrade);
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
			client.removeListener("gameUpdate", gameUpdateListener);
			client.removeListener("death", deathListener);
			client.removeListener("joinGame", respawn);
			client.removeListener("abilityUpgrade", abilityUpgradeListener);
			client.removeListener("abilityActivated", abilityActivatedListener);
		};
	}, [client, respawn]);
	// initialize board state and head position to client's
	const [boardState, setBoardState] = useState(client?.boardState);
	const [headPos, setHeadPos] = useState(client?.headPos);
	// store ability cooldown and last ability use
	const [cooldown, setCooldown] = useState(client?.cooldown);
	const [lastAbilityUse, setLastAbilityUse] = useState(client?.lastAbilityUse);
	// store death data, and state
	const [deathData, setDeathData] = useState(null);
	const [dead, setDead] = useState(false);
	// store ability upgrade data
	const [abilityUpgradeOptions, setAbilityUpgradeOptions] = useState(null);
	const [isUpgrade, setIsUpgrade] = useState(false);
	const showAbilityPopup = useMemo(() => abilityUpgradeOptions != null, [abilityUpgradeOptions]);

	return (
		<div id={styles['game-screen']}>
			<Board boardState={boardState} headPos={headPos} tileSize={tileSize}/>

			<AbilityIndicator show={cooldown > 0} cooldown={cooldown} lastAbilityUse={lastAbilityUse}/>

			<DeathPopup show={dead} stats={deathData} respawn={respawn}/> 
			<UpgradeAbilityPopup show={showAbilityPopup} options={abilityUpgradeOptions} isUpgrade={isUpgrade} 
				upgradeAbility={(abilityName) => client.upgradeAbility(abilityName)}/>
		</div>
	);
};

