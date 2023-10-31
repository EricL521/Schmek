// Customize settings for the game
'use-client'

import { unFocus } from '../unFocus';

import Keybind from './keybind';
import styles from './settings.module.css';

import Image from 'next/image';

// keybinds is an array [ [key, action] ... ]
export default function Settings({ actions, keybinds, controls, setKeybind, addKeybind, removeKeybind, sortKeybinds, resetKeybinds }) {
	return (
		<div id={styles['settings-panel']} className={styles['interactive']}>
			<Image src="./icons/settings.svg" alt="settings" width={1000} height={1000} 
				id={styles['settings-icon']} className={styles['interactive']}/>

			<h2 className={styles['interactive']}>Settings</h2>

			<div id={styles['keybinds-panel']} className={styles['interactive']}>
				<div id={styles['keybinds-title']}>
					<h3 className={styles['interactive']}>Keybinds</h3>
					<button id={styles['reset-button']} className={styles['interactive']} onClick={() => {resetKeybinds(); unFocus();}}>
						Reset
					</button>
					<button id={styles['sort-button']} className={styles['interactive']} onClick={() => {sortKeybinds(); unFocus();}}>
						Sort
					</button>
					<button id={styles['new-button']} className={styles['interactive']} onClick={() => {addKeybind("click to bind", ""); unFocus();}}>
						New
					</button>
				</div>

				<table id={styles['keybinds']}>
					<tbody>
						{keybinds.map((keybind, index) =>
							<Keybind key={index} actions={actions} controls={controls} keybind={keybind} 
								setKeybind={(key, action) => setKeybind(index, key, action)} removeKeybind={() => removeKeybind(index)}/>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};