// initialize channel and game
const geckos = import("@geckos.io/server");
const fs = require("fs");
const { initializeGame } = require("./initialize-game");

// need to make function to take in server and initialize channel
const initializeServerLogic = async (server) => {
	// first initialize game
	const game = initializeGame();

	// then initialize channel
	const io = (await geckos).default({
		portRange: {
			min: 10000,
			max: 10000
		}
	});
	io.addServer(server);
	
	// get all events from channel-events folder
	const events = fs.readdirSync(__dirname + "/channel-events").map(fileName => require("./channel-events/" + fileName));	
	// add all events to each channel
	io.onConnection(channel => {
		events.forEach((event) => {
			channel.on(event.eventName, data => event.function(game, channel, data));
		});
	});
};

module.exports = { initializeServerLogic };