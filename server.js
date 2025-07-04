const next = require('next');
const { createServer } = require('http');
const { parse } = require('url');
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.SERVER_PORT || 3000;
const hostname = process.env.SERVER_HOSTNAME || 'localhost';
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
 
console.log("Preparing app...");
app.prepare().then(() => {
	console.log("Creating server...");
	const server = createServer(async (req, res) => {
		try {
			// Be sure to pass `true` as the second argument to `url.parse`.
			// This tells it to parse the query portion of the URL.
			const parsedUrl = parse(req.url, true);
			const { pathname, query } = parsedUrl;
		
			if (pathname === '/a') {
				await app.render(req, res, '/a', query);
			} else if (pathname === '/b') {
				await app.render(req, res, '/b', query);
			} else {
				await handle(req, res, parsedUrl);
			}
		} catch (err) {
			console.error('Error occurred handling', req.url, err);
			res.statusCode = 500;
			res.end('internal server error');
		}
	}).once('error', (err) => {
		console.error(err);
		process.exit(1);
    });

	// initialize server logic
	require('./server-logic/initialize-server-logic').initializeServerLogic(server);

    server.listen(port, () => {
		console.log(`> Ready on http://${hostname}:${port}`);
    });
});