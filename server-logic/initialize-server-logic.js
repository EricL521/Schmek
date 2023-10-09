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
	const events = fs.readdirSync(__dirname + "/socket-events").map((file) => {
		return require("./socket-events/" + file);
	});	
	// add all events to each socket
	io.on("connection", (socket) => {
		console.log("hey");
		events.forEach((event) => {
			socket.on(event.eventName, (... data) => {
				event.function(game, socket, ... data);
			});
		});
	});
};

module.exports = { initializeServerLogic };