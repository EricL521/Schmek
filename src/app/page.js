'use client'
import styles from './page.module.css'

import PlayerInput from './(game-logic)/playerInput.js'

export default function Home() {
	return (
		<main>
			<PlayerInput />
			<h1>SCHMEK</h1>
		</main>
	)
}
