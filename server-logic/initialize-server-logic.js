// initialize socket and game
const { Server } = require("socket.io");
const fs = require("fs");
const { initializeGame } = require("./initialize-game");

// need to make function to take in server and initialize socket
const initializeServerLogic = (server) => {
	// first initialize game
	const game = initializeGame();

	// then initialize socket
	const io = new Server(server);
	
	// get all events from socket-events folder
	const events = fs.readdirSync(__dirname + "/socket-events").map(fileName => require("./socket-events/" + fileName));	
	// add all events to each socket
	io.on("connection", (socket) => {
		events.forEach((event) => {
			socket.on(event.eventName, (...data) => event.function(game, socket, ...data));
		});
	});
};

module.exports = { initializeServerLogic };