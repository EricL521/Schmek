// panel to change size of tiles, and theme
'use-client'

import styles from './ui-panel.module.css';
import customThemeManagerStyle from './theme-manager.module.css';

import SliderTextBox from './slider-text-box';
import ThemeManager from '../../theme-manager';

export default function UIPanel({ visible, theme, setTheme, tileSize, setTileSize }) {
	return (
		<div id={styles['ui-panel']} className={[styles['interactive'], visible || styles['hidden']].join(' ')}>
			<h3 className={styles['interactive']}>UI</h3>

			<div id={styles['options-panel']}>
				<div className={[styles['row-flex'], styles['options-row']].join(' ')}>
					<p className={styles['interactive']}>Tile Size </p>
					<SliderTextBox label="px" value={tileSize} onValue={setTileSize} min={1} max={1000} step={1}/>
				</div>
				<div className={[styles['row-flex'], styles['options-row']].join(' ')}>
					<p className={styles['interactive']}>Theme </p>
					<ThemeManager customStyle={customThemeManagerStyle} theme={theme} setTheme={setTheme} autoHide={false} />
				</div>
			</div>
		</div>
	);
};
