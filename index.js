// # SETUP
var express   = require('express');
var app       = express();
var server    = require('http').createServer(app);
var io        = require('socket.io')(server);
var config    = require('./config')();
var utils     = require('./lib/utils');
var dirty     = require('dirty')('turnt.db');
var path      = require('path');

// make tcp server used for the editing interface
var tcpServer = require('net').createServer(function(socket){
  socket.pipe(socket);
  editor.setTcpSocket(socket);
  socket.on('data', editor.editingComplete);
  socket.on('close', function(){ if(socket.writable) socket.end(); });
  socket.on('error', function(e){ });
}).listen(config.TCP_PORT, '127.0.0.1');

// express configuration
app.use(express.static('public'));
app.use(express.static('tmp'));
server.listen(config.PORT);
app.set('views', path.join(__dirname, 'views'));



// # EVENT HANDLERS
var arduino   = require('./lib/arduino');
var editor    = require('./lib/editor');
var display   = require('./lib/display');
var camera    = require('./lib/camera');
var video     = require('./lib/video');
var turntable = require('./lib/turntable');


var softStart = function(){
	// open the interfaces
	camera.killProcess();

	setTimeout(function(){
		video.cleanFrames();
		camera.startLiveStream();
		utils.launchGUI();
		display.setState('ready');
		arduino.lights(0);
    arduino.twinkleButton();
	}, 2000);
};


// give the interface a web socket to use
display.setWebSocket(io);

// have the display module listen for events from the webpage
io.on('connection', display.listen);

// start it
softStart();

// when a physical button press comes from the arduino
arduino.events.on('start', function(){
  if(display.getState() == 'ready'){
    arduino.stopTwinkling();
    display.showScreen('countdown');
    display.debug('Starting Session');
  } else if(display.getState() == 'contact'){
    display.showScreen('ready');
  } else if(display.getState == 'tutorial'){
    arduino.stopTwinkling();
    editor.launch();
  }
});

// add a fail save which allows "some" stuff to get restarted
arduino.events.on('restart', softStart);

// when the interface countdown is done
display.events.on('countdown-complete', function(){
  arduino.lights(1);
  setTimeout(camera.record, 1000);
  display.debug('Recording');
});

// when the camera is done recording
camera.events.on('done-recording', function(){
  arduino.lights(0);
  display.showScreen('tutorial');
  arduino.twinkleButton();
  display.debug('Done Recording');
});

// when the turntable detects some new input
turntable.events.on('input-update', function(data){
  editor.turntableUpdate(data);
});

// when the external editor is all done
editor.events.on('editing-complete', function(){
  display.showScreen('done');
  video.assemble();
  display.debug('Assembling Frames');
});

// when the video frames are assembled
video.events.on('assembled', function(){
  display.showScreen('review');
  display.debug('Waiting for Contact Information');
});

// when the user has entered their contact information
display.events.on('contact-entered', function(phone){
  display.debug('Uploading Video');

  // upload our content to the internet
  video.process(phone).then(function(guid){
    display.debug('Uploaded!');
  });
});

// when the video is ready for the showcase
video.events.on('ready-to-showcase', function(guid){
  display.debug('On the showcase');
  dirty.set(guid, guid);
  display.newVideo(guid);
});

// when the display is ready to go again
display.events.on('ready', function(){
  display.debug('Ready');
  video.cleanFrames();
  camera.startLiveStream();
  arduino.twinkleButton();
});



// # ROUTES
var routes = require('./lib/routes');
app.get('/', routes.interface);
app.post('/stream-image', routes.streamImage);
app.get('/showcase-view', routes.showcaseView);
app.get('/showcase', routes.showcase);
app.get('/prompt', routes.getPrompt);
