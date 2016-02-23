var EE        = require('events').EventEmitter;
var _         = require('lodash');
var midi      = require('midi');
var emitter   = new EE();

// 48, 49, 50, 51, 31
var turntable = new midi.input();
var inputs    = [
  {
    index : 31,
    name  : 'slide',
    value : 0
  },
  {
    index : 51,
    name  : 'jog-wheel',
    value : 0
  }
];


// loop over the indexes we plan to listen to for faster
// message filtering from the midi controller
var listeningToIndexes = [];
inputs.forEach(function(input){
  listeningToIndexes.push(input.index);
});


// listen to midi messages
turntable.on('message', function(deltaTime, data){

  // quick filter
  if(data[0] == 176 && listeningToIndexes.indexOf(data[1]) != -1){

    // which direction is the input moving
    var message   = null;
    var value     = data[2];
    var input     = _.find(inputs, { index : data[1] });

    if(input){
      if(input.name == 'jog-wheel'){
        if(value > input.value) message = 1;
        else if(value < input.value) message = 0;
      } else if(input.name == 'slide'){
        if(value != input.value) message = value;
      }

      input.value = value;

      if(message !== null)
        emitter.emit('input-update', input, message, new Date().getTime());
    }
  }
});


// listen...
try{
  turntable.openPort(0);
} catch(e){
  console.log('Could not connect to turntable', e);
}



// return an event emitter
module.exports = function(){ return emitter;};
