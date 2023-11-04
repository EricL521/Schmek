// shows a keybinding in the settings menu
'use-client'

import { useEffect, useState } from 'react';
import { unFocus } from '../../unFocus';

import styles from './keybind.module.css';

// keybind is in form [key, action]
// setKeybind takes in key, action
// options is an array of options for the action
export default function Keybind({ keybind, allActions, usedActions, setKeybind, removeKeybind }) {
	const [keyListening, setKeyListening] = useState(false);

	// add listener for when user presses a key, if keyListening is true
	useEffect(() => {
		if (!keyListening) return;

		// add listener for key press
		const keyListener = (e) => {
			setKeybind(e.key, keybind[1]);
			setKeyListening(false);
			// also, cancel event, so it doesn't press the button
			e.preventDefault();
			// unfocus the button, if pressed with mouse
			unFocus();
		};
		document.addEventListener('keydown', keyListener);
		// add listener for mouse click
		const clickListener = (e) => {
			setKeyListening(false);
		};
		document.addEventListener('click', clickListener);

		// return a function to remove listeners
		return () => {
			document.removeEventListener('keydown', keyListener)
			document.removeEventListener('click', clickListener)
		};
	}, [keybind, setKeybind, keyListening]);
	
	return (
		<tr className={[styles['keybind']].join(' ')}>
			<td>
				<button className={[keyListening && styles['listening'], styles['key-button'], styles['interactive']].join(' ')}
				onClick={() => {if (keyListening) unFocus(); setKeyListening(!keyListening);}} >
					{ keyListening? "press a key" :
					keybind[0] == " " ? "Space" : keybind[0] }
				</button>
			</td>
			<td>
				<select className={styles['interactive']} value={keybind[1]} 
				onChange={(e) => {setKeybind(keybind[0], e.target.value); }} >
					<option value="">None</option>
					{allActions.filter(
						action => action == keybind[1] || !usedActions?.has(action)
					).map(option => 
						<option key={option} value={option}>{option}</option>
					)}
				</select>
			</td>
			<td>
				<button className={[styles['close-button'], styles['interactive']].join(' ')}
				onClick={() => {removeKeybind(); unFocus();}}>
					<p>x</p>
				</button>
			</td>
		</tr>
	);
};
