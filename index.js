var express   = require('express');
var app       = express();
var server    = require('http').createServer(app);
var io        = require('socket.io')(server);
var camera    = require('./lib/camera');
var gopro     = require('./lib/gopro');
var bus       = require('./event-bus');
var video     = require('./lib/video');
var turntable = require('./lib/turntable')();


// setup a tcp server for the editing interface
var tcpServer = require('net').createServer(function(socket){
  bus.setTcpSocket(socket);
  socket.on('data', bus.editingComplete);
  socket.on('close', socket.end);
}).listen(process.env.TCP_PORT || 3001, '127.0.0.1');

// configure express
app.use(express.static('public'));
app.use(express.static('tmp'));
server.listen(process.env.PORT || '3000');

// setup the event bus and listen for it's events
bus.setWebSocket(io);
bus.events.on('video-downloaded', bus.launchEditor);
bus.events.on('editing-complete', video.assembleFrames);

// connect gopro and listen for events
bus.joinWifi('gopro', gopro.setup);
gopro.events.on('ready', bus.goproReady);
gopro.events.on('recording', bus.cameraRecording);
gopro.events.on('done-recording', bus.cameraDoneRecording);

// events from the web page interface
io.on('connection', bus.initializeWebpageEvents);

// listen to updates from the turntable, then send over via tcp socket
turntable.on('input-update', bus.turntableUpdate);

// routes
app.get('/', function(req, res){ res.render('interface'); });
