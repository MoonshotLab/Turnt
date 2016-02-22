var express   = require('express');
var app       = express();
var server    = require('http').createServer(app);
var io        = require('socket.io')(server);
var camera    = require('./lib/camera');
var bus       = require('./event-bus');
var turntable = require('./lib/turntable')();


// setup a tcp server for the editing interface
var tcpServer = require('net').createServer(function(socket){
  bus.setTcpSocket(socket);
  socket.pipe(socket);
});
tcpServer.listen(process.env.TCP_PORT || 3001, '127.0.0.1');

// configure express
app.use(express.static('public'));
app.use(express.static('tmp'));
server.listen(process.env.PORT || '3000');

// setup the event bus and listen for it's events
bus.setWebSocket(io);
bus.events.on('video-downloaded', bus.launchEditor);

// connect camera and listen for events
camera.setSocket(io);
camera.connect();
camera.events.on('connected', bus.cameraConnected);
camera.events.on('recording', bus.cameraRecording);
camera.events.on('done-recording', bus.cameraDoneRecording);

// events from the web page interface
io.on('connection', bus.initializeWebpageEvents);

// listen to updates from the turntable, then send over via tcp socket
turntable.on('input-update', bus.turntableUpdate);
