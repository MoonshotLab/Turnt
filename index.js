// # SETUP
var express   = require('express');
var app       = express();
var server    = require('http').createServer(app);
var io        = require('socket.io')(server);
var config    = require('./config')();
var utils     = require('./lib/utils');
var path      = require('path');

// make tcp server used for the editing interface
var tcpServer = require('net').createServer(function(socket){
  editor.setTcpSocket(socket);
  socket.on('data', utils.editingComplete);
  socket.on('close', socket.end);
}).listen(process.env.TCP_PORT || 3001, '127.0.0.1');

// express configuration
app.use(express.static('public'));
app.use(express.static('tmp'));
server.listen(config.PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// join the gopro network
utils.joinWifi('gopro').then(function(){
  gopro.setup();
  display.debug('Ready');
  display.showScreen('ready');
});




// # EVENT HANDLERS
var arduino   = require('./lib/arduino');
var editor    = require('./lib/editor');
var display   = require('./lib/display');
var gopro     = require('./lib/gopro');
var video     = require('./lib/video');
var turntable = require('./lib/turntable');

// give the interface a web socket to use
display.setWebSocket(io);

// have the display module listen for events from the webpage
io.on('connection', display.listen);
gopro.startLiveStream();

// when a physical button press comes from the arduino
arduino.events.on('start', function(){
  display.showScreen('countdown');
  display.debug('Starting Session');
});

// when the interface countdown is done
display.events.on('countdown-complete', function(){
  arduino.lights(1);
  gopro.record();
  display.debug('Recording');
});

// when the gopro is done recording
gopro.events.on('done-recording', function(){
  arduino.lights(0);
  editor.launch();
  display.debug('Done Recording');
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
    display.debug('Updating the wifi connection...');
    display.showScreen('done');

    // we need to dump the gopro wifi to connect to the internet
    utils.joinWifi('internet').then(function(){
      display.debug('Uploading video...');

      // upload our content to the internet
      video.process(contact).then(function(){
        display.debug('Uploaded! Reinitializing...');

        utils.joinWifi('gopro').then(function(){
          display.debug('Ready');
          display.showScreen('ready');
          gopro.startLiveStream();
        });
      });

    });
  }
});



// # ROUTES
var routes = require('./lib/routes');
app.get('/', routes.interface);
app.post('/stream-image', routes.streamImage);
