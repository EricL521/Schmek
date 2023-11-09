// Customize settings for the game
'use-client'

import { useState } from 'react';
import { unFocus } from '../unFocus';

import styles from './settings.module.css';

import Image from 'next/image';
import KeybindsPanel from './(keybinds)/keybinds-panel';
import UIPanel from './(ui)/ui-panel';

// keybinds is an array [ [key, action] ... ]
export default function Settings({ client, tileSize, setTileSize, theme, setTheme }) {
	const [category, setCategory] = useState('keybinds');

	// cancel key presses when focused on settings, so they don't get sent to the game
	const cancelPropagation = (e) => e.stopPropagation();

	return (
		<div id={styles['settings-panel']} className={styles['interactive']} onKeyDown={cancelPropagation}>
			<Image src="./icons/settings.svg" alt="settings" width={1000} height={1000} 
				id={styles['settings-icon']} className={styles['interactive']}/>

			<h2 className={styles['interactive']}>Settings</h2>

			<div id={styles['category-selecter']}>
				<button className={[styles['interactive'], category == 'keybinds' && styles['selected']].join(' ')}
					onClick={() => {setCategory('keybinds'); unFocus();}}>
					Keybinds
				</button>
				<button className={[styles['interactive'], category == 'ui' && styles['selected']].join(' ')} 
					onClick={() => {setCategory('ui'); unFocus();}}>
					UI
				</button>
			</div>

			<div id={styles['categories']}>
				<KeybindsPanel visible={category == 'keybinds'} client={client} />
				<UIPanel visible={category == 'ui'} tileSize={tileSize} setTileSize={setTileSize} theme={theme} setTheme={setTheme} />
			</div>
			
		</div>
	);
};