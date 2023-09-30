const { Server } = require("socket.io");

const initializeSocket = (server) => {
	const io = new Server(server);

	io.on("connection", (socket) => {
		console.log("hey!");

		socket.on("disconnect", () => {
			console.log("bye!");
		});
	});
}

module.exports = {initializeSocket};