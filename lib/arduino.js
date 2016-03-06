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
var ready       = false;
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
        name      : 'restart',
        location  : 2,
        type      : board.MODES.INPUT
      },
      {
        name      : 'start',
        location  : 4,
        type      : board.MODES.INPUT
      },
      {
        name      : 'start-light',
        location  : 5,
        type      : board.MODES.OUTPUT
      },
      {
        name      : 'lights',
        location  : 7,
        type      : board.MODES.OUTPUT
      }
    ];

    // initialize the pins once the board is ready
    // and listen for events
    board.on('ready', function(){
      pins.forEach(function(pin){
        ready = true;
        board.pinMode(pin.location, pin.type);

        if(pin.type === 0){
          board.digitalRead(pin.location, function(val){
            if(val == 1) emitter.emit(pin.name);
          });
        }
      });
    });
  }
});



// 0 || 1
exports.lights = function(state){
  if(board && ready){
    var light = getPinByName('lights');
    board.digitalWrite(light.location, state);
  }
};


// twinkle the button
var twinkleInterval;
var twinkleState = 0;
exports.twinkleButton = function(){
  twinkleInterval = setInterval(function(){
    if(board && ready){
      var light = getPinByName('start-light');
      if(twinkleState === 0) {
        board.digitalWrite(light.location, 1);
        twinkleState = 1;
      } else {
        board.digitalWrite(light.location, 0);
        twinkleState = 0;
      }
    }
  }, 1000);
};


// cut out the twinkling already
exports.stopTwinkling = function(){
  if(twinkleInterval) clearInterval(twinkleInterval);
  if(board && ready){
    var light = getPinByName('start-light');
    board.digitalWrite(light.location, 0);
  }
};


var getPinByName = function(name){
  var foundPin;
  pins.forEach(function(pin){
    if(pin.name == name) foundPin = pin;
  });

  return foundPin;
};
