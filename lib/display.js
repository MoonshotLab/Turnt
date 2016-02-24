// # ABOUT
// Listens for events coming from the web interface
// Broadcasts messages to all connected web clients


// # BROADCAST EVENTS
// countdown-complete
//    the countdown has completed


var events      = require('events');
var emitter     = new events.EventEmitter();
var webSocket   = null;
exports.events  = emitter;


// setup the websocket connection
exports.setWebSocket = function(socket){
  webSocket = socket;
};

// tell the front facing interface to show a certain screen
exports.showScreen = function(screen, message){
  webSocket.sockets.emit('screen', screen);
};

// send debug messages to the utility interface
exports.debug = function(data){
  webSocket.sockets.emit('debug', data);
};

// listen for events coming from connected web clients
exports.listen = function(socket){
  socket.on('countdown-complete', function(){
    emitter.emit('countdown-complete');
  });

  socket.on('contact-entered', function(){
    emitter.emit('contact-entered');
  });
};
