// # SETUP
var express   = require('express');
var app       = express();
var server    = require('http').createServer(app);
var io        = require('socket.io')(server);
var utils     = require('./lib/utils');

// make tcp server used for the editing interface
var tcpServer = require('net').createServer(function(socket){
  editor.setTcpSocket(socket);
  socket.on('data', utils.editingComplete);
  socket.on('close', socket.end);
}).listen(process.env.TCP_PORT || 3001, '127.0.0.1');

// express configuration
app.use(express.static('public'));
app.use(express.static('tmp'));
server.listen(process.env.PORT || '3000');

// join the gopro network
utils.joinWifi('gopro').then(function(){
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

// have the display module listen for events from the webpage
io.on('connection', display.listen);

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
  editor.launch();
  display.showScreen('done');
  arduino.lights(0);
  display.debug('Done Recording');
});

// when the turntable detects some new input
turntable.events.on('input-update', function(data){
  editor.turntableUpdate(data);
});

// when the external editor is all done
editor.events.on('editing-complete', function(){
  video.assemble();
  display.debug('Assembling Frames');
});

// when the video frames are assembled
video.events.on('video-assembled', function(){
  display.showScreen('contact');
  display.debug('Waiting for Contact Information');
});

// when the user has entered their contact information
display.events.on('contact-entered', function(contact){
  display.showScreen('Joining internet connected wifi...');

  if(contact === null){
    display.debug('Ready');
    display.showScreen('ready');
  } else {
    display.debug('Updating the wifi connection...');

    // we need to dump the gopro wifi to connect to the internet
    utils.joinWifi('internet').then(function(){
      display.debug('Uploading video...');

      // upload our content to the internet
      video.process(contact).then(function(){
        display.debug('Uploaded! Reinitializing...');

        utils.joinWifi('gopro').then(function(){
          display.debug('Ready');
          display.showScreen('ready');
        });
      });

    });
  }
});



// # ROUTES
app.get('/', function(req, res){ res.render('interface'); });
