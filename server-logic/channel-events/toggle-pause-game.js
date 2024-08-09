// must be enabled in game-config.json
const { playerTogglePauseGameEnabled, tps } = require("../game-config.json");

module.exports = {
	eventName: "togglePauseGame",
	function: (game, _) => {
		if (!playerTogglePauseGameEnabled) return; // if not enabled, do nothing

		// if game is updating, pause it
		if (game.tps) game.stopUpdateLoop();
		// if game is paused, resume it
		else game.startUpdateLoop(tps);
	}
};