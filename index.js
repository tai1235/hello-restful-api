// Dependencies
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const greeting = require('./greeting');

// Instantiate the HTTP server
const httpServer = http.createServer(function (req, res) {
    unifiedServer(req, res);
});
httpServer.listen(config.httpPort, function () {
    console.log("Server is listening on port " + config.httpPort);
});

// Instantiate the HTTPS server
const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
    unifiedServer(req, res);
});
httpsServer.listen(config.httpsPort, function () {
    console.log("Server is listening on port " + config.httpsPort);
});

const unifiedServer = function (req, res) {
    // Parse the URL
    const parseUrl = url.parse(req.url, true);

    // Parse URL's path
    const path = parseUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    // const pathItem = trimmedPath.split('/');

    // Parse URL's query string
    const queryObject = parseUrl.query;

    // Parse method and headers
    const method = req.method.toUpperCase();
    const headers = req.headers;

    // Get the payload, if any
    var decoder = new stringDecoder('utf-8');
    var buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });

    // Handle request
    req.on('end', function () {
        buffer += decoder.end();

        const data = {
            'path': trimmedPath,
            'query': queryObject,
            'method': method,
            'header': headers,
            'payload': buffer
        }

        const choosenRoute = typeof (routers[trimmedPath]) !== 'undefined' ? routers[trimmedPath] : handlers.notFound;
        choosenRoute(data, function (statusCode, payload) {
            // Validate status code and payload
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
            payload = typeof (payload) == 'object' ? payload : {};
            // Prepare and send response
            const payloadString = JSON.stringify(payload);
            console.log("Response: " + statusCode + " " + payloadString);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
}

// Container holds the handlers for all requests
const handlers = {};

// Hello handlers
handlers.hello = function (data, callback) {
    const payload = {};
    payload.greeting = typeof (greeting[data.query.lang]) == 'string' ? greeting[data.query.lang] : greeting.EN;
    if (data.query.name)
        payload.name = data.query.name;
    callback(200, payload);
}

// Ping handlers
handlers.ping = function (data, callback) {
    callback(200);
}

// Notfound handlers
handlers.notFound = function (data, callback) {
    callback(404);
}

// Routing system
var routers = {
    'hello': handlers.hello,
    'ping': handlers.ping,
}