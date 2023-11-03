// Customize settings for the game
'use-client'

import styles from './settings.module.css';

import Image from 'next/image';
import KeybindsPanel from './(keybinds)/keybinds-panel';

// keybinds is an array [ [key, action] ... ]
export default function Settings({ client }) {
	return (
		<div id={styles['settings-panel']} className={styles['interactive']}>
			<Image src="./icons/settings.svg" alt="settings" width={1000} height={1000} 
				id={styles['settings-icon']} className={styles['interactive']}/>

			<h2 className={styles['interactive']}>Settings</h2>

			<KeybindsPanel client={client} />
			
		</div>
	);
};