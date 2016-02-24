// # ABOUT
// Listens for physical interaction from an Arduino running
// the firmata library


// # BROADCAST EVENTS
// start
//    the start button was pressed


var events      = require('events');
var emitter     = new events.EventEmitter();
exports.events  = emitter;


// when button pressed
// emitter.emit('start');

exports.turnLightsOn = function(){
  // turn the lights on
};
