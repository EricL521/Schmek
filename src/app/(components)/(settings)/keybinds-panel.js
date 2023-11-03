// panel for customizing keybinds
'use-client'

import { useReducer } from "react";
import { unFocus } from "../unFocus";

import styles from './keybinds-panel.module.css';

import Keybind from "./keybind";

export default function KeybindsPanel({ client }) {
	const [, forceUpdate] = useReducer(x => x + 1, 0);

	return (
		<div id={styles['keybinds-panel']} className={styles['interactive']}>
			<div id={styles['keybinds-title']}>
				<h3 className={styles['interactive']}>Keybinds</h3>
				<button id={styles['reset-button']} className={styles['interactive']} 
				onClick={() => {client.resetKeybinds(); forceUpdate(); unFocus();}}>
					Reset
				</button>
				<button id={styles['sort-button']} className={styles['interactive']} 
				onClick={() => {client.sortKeybinds(); forceUpdate(); unFocus();}}>
					Sort
				</button>
				<button id={styles['new-button']} className={styles['interactive']} 
				onClick={() => {client.addKeybind("click to bind", ""); forceUpdate(); unFocus();}}>
					New
				</button>
			</div>

			<table id={styles['keybinds']}>
				<tbody>
					{client?.controlsArray.map((keybind, index) =>
						<Keybind key={index} allActions={Array.from(client?.actions.keys()) ?? new Set()} 
							usedActions={client?.controls.get(keybind[0]) ?? new Set()} keybind={keybind} 
							setKeybind={(key, action) => {client.setKeybind(index, key, action); forceUpdate();}}
							removeKeybind={() => {client.removeKeybind(index); forceUpdate();}}/>
					)}
				</tbody>
			</table>
		</div>
	)
};