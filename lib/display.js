// # ABOUT
// Listens for events coming from the web interface
// Broadcasts messages to all connected web clients


// # BROADCAST EVENTS
// countdown-complete
//    the countdown has completed


var events      = require('events');
var emitter     = new events.EventEmitter();
var webSocket   = null;
var state       = 'ready';
exports.events  = emitter;


// setup the websocket connection
exports.setWebSocket = function(socket){
  webSocket = socket;
};

// tell the front facing interface to show a certain screen
exports.showScreen = function(screen){
  state = screen;
  webSocket.sockets.emit('screen', screen);
};

// send new vidyas to the showcase interface
exports.newVideo = function(guid){
  webSocket.sockets.emit('new-video', guid);
};

// send debug messages to the utility interface
exports.debug = function(data){
  console.log(data);
  webSocket.sockets.emit('debug', data);
};

// listen for events coming from connected web clients
exports.listen = function(socket){
  socket.on('countdown-complete', function(){
    emitter.emit('countdown-complete');
  });

  socket.on('contact-entered', function(phone){
    emitter.emit('contact-entered', phone);
  });

  socket.on('tutorial-done', function(){
    emitter.emit('tutorial-done');
  });

  socket.on('ready', function(){
    state = 'ready';
  });
};

// get the state of the
exports.getState = function(){
  return state;
};
