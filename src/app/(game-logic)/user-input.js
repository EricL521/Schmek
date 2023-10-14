// component which will detect user input and send it to the server

import { useEffect } from "react";

export default function UserInput({ client }) {
	// detect key presses
	useEffect(() => {
		const onKeyDown = (e) => {
			client.keyPress(e.key);
		};
		window.addEventListener('keydown', onKeyDown);

		// on unmount, remove event listener
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [client]);
	
	return null;
};