// # ABOUT
// Listens for physical interaction from an Arduino running
// the firmata library


// # BROADCAST EVENTS
// start
//    the start button was pressed

var config      = require('../config')();
var firmata     = require('firmata');
var events      = require('events');
var emitter     = new events.EventEmitter();
var board       = null;
var pins        = [];
exports.events  = emitter;


// find which port firmata is running on
firmata.requestPort(function(err, port){

  if(err){ console.log(err); }
  else {
    // init the board and define the pins
    board = new firmata(port.comName);
    pins  = [
      {
        name      : 'start',
        location  : 4,
        type      : board.MODES.INPUT
      },
      {
        name : 'lights',
        location  : 7,
        type : board.MODES.OUTPUT
      }
    ];

    // initialize the pins once the board is ready
    // and listen for events
    board.on('ready', function(){
      pins.forEach(function(pin){
        board.pinMode(pin.location, pin.type);

        if(pin.type === 0){
          board.digitalRead(pin.location, function(val){
            if(val == 1) emitter.emit(name);
          });
        }
      });
    });
  }
});



// 0 || 1
exports.lights = function(state){
  if(board){
    var light;

    pins.forEach(function(pin){
      if(pin.name == 'lights') light = pin;
    });

    board.digitalWrite(light.location, state);
  }
};
