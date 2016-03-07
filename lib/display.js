// # ABOUT
// Listens for events coming from the web interface
// Broadcasts messages to all connected web clients


// # BROADCAST EVENTS
// countdown-complete
//    the countdown has completed


var events      = require('events');
var utils       = require('./utils');
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

// send new vidyas to ONE of the showcase interfaces
exports.newVideo = function(guid){
  webSocket.sockets.emit('new-video', {
    guid    : guid,
    screen  : utils.randomNumber(1, 3)
  });
};

// send debug messages to the utility interface
exports.debug = function(data){
  if(typeof data == 'object'){
    try{
      data = JSON.stringify(data);
    } catch(e){ console.log(e); }
  }
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

  socket.on('state-change', function(newState){
    state = newState;
    emitter.emit(state);
  });
};

// get the state of the display
exports.getState = function(){
  return state;
};

// set the state of the display
exports.setState = function(){
  state = 'ready';
};
