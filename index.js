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
  socket.on('close', socket.end);
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

// give the interface a web socket to use
display.setWebSocket(io);

// have the display module listen for events from the webpage
io.on('connection', display.listen);
camera.startLiveStream();

// when a physical button press comes from the arduino
arduino.events.on('start', function(){
  if(display.getState() == 'ready'){
    display.showScreen('countdown');
    display.debug('Starting Session');
  }
});

// when the interface countdown is done
display.events.on('countdown-complete', function(){
  arduino.lights(1);
  camera.record();
  display.show('recording');
  display.debug('Recording');
});

// when the camera is done recording
camera.events.on('done-recording', function(){
  arduino.lights(0);
  display.show('tutorial');
  display.debug('Done Recording');
});

// when the tutorial video is done
display.events.on('tutorial-done', function(){
  editor.launch();
});

// when the turntable detects some new input
turntable.events.on('input-update', function(data){
  editor.turntableUpdate(data);
});

// when the external editor is all done
editor.events.on('editing-complete', function(){
  display.showScreen('processing');
  video.assemble();
  display.debug('Assembling Frames');
});

// when the video frames are assembled
video.events.on('video-assembled', function(){
  display.showScreen('contact');
  display.debug('Waiting for Contact Information');
});

// when the user has entered their contact information
display.events.on('contact-entered', function(phone){
  display.debug('Joining internet connected wifi...');

  if(phone === null){
    display.debug('Ready');
    display.showScreen('ready');
  } else {
    display.debug('Uploading video...');
    display.showScreen('done');

    // upload our content to the internet
    video.process(phone).then(function(guid){

      // save the file locally
      db.set(guid, guid);
      display.newVideo(guid);

      // tell the client
      display.debug('Uploaded! Ready');
      display.showScreen('ready');
      camera.startLiveStream();
    });
  }
});



// # ROUTES
var routes = require('./lib/routes');
app.get('/', routes.interface);
app.post('/stream-image', routes.streamImage);
app.get('/showcase-view', routes.showcaseView);
app.get('/showcase', routes.showcase);
app.get('/prompt', routes.getPrompt);
