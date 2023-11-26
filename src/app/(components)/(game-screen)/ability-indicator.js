// shows ability and ability cooldown

import { useRef } from 'react';

import styles from './ability-indicator.module.css';

export default function AbilityIndicator({ show, cooldown, lastAbilityUse }) {
	const animateRef = useRef(null);

	const timeSinceLastAbilityUse = (Date.now() - lastAbilityUse) / 1000;
	const remainingCooldown = Math.max(0, cooldown - timeSinceLastAbilityUse);
	const animationProportion = remainingCooldown / cooldown;
	// restart animation
	animateRef.current?.beginElement();

	return (
		<div id={styles['positioning-div']} className={show? '' : styles['hidden']}>
			<div id={styles['ability-indicator']} className={styles['interactive']}>
				{/* Copied from https://stackoverflow.com/questions/26178095/svg-circle-animation */}
				<svg version="1.1" xmlns="http://www.w3.org/2000/svg"
				xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 34 34" xmlSpace="preserve">
					<circle id={styles['circle']} className={remainingCooldown <= 0? styles['active']: ''} 
					strokeWidth={2} cx={17} cy={17} r={16} strokeDasharray={32 * Math.PI} strokeLinecap="round" >
						{(remainingCooldown > 0)?
							<animate ref={animateRef} attributeName="stroke-dashoffset" begin={"indefinite"} 
								from={32 * Math.PI * animationProportion} to={0} dur={remainingCooldown}>
							</animate>
						: null}
					</circle>
				</svg>
			</div>
		</div>
	);
};

