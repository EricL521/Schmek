// screen displayed while connecting and loading from server

import style from './loading-screen.module.css';

export default function LoadingScreen() {
	return (
		<div id={style["loading-screen"]}>
			<h1>Loading...</h1>
		</div>
	);
}