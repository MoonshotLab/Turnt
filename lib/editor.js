// # ABOUT
// A controller for the openFrameworks c++ interface which allows
// participants to live edit video with fx


// # BROADCAST EVENTS
// done
//    the editing process has been completed
//    and all frames are written
// done-recording
//    no longer recording


var config      = require('../config')();
var utils 	    = require('./utils');
var path        = require('path');
var cp          = require('child_process');
var events      = require('events');
var emitter     = new events.EventEmitter();
exports.events  = emitter;
var tcpSocket   = null;


// set the tcp socket for communication
exports.setTcpSocket = function(socket){
  tcpSocket = socket;
};


// launch the c++ editor
exports.launch = function(){
  var fileName  = 'Turnt-EditorInterface.app';
  var directive = 'open';
  if(utils.isWindows){
  	fileName  = 'Turnt-EditorInterface.exe';
  	directive = '';
  }

  var editorPath  = path.join(config.TURNT_EDITOR_INTERFACE_PATH, fileName);
  console.log(editorPath);
  var command     = directive + ' ' + editorPath;
  cp.exec(command);
};


// any message received from the c++ interface is
// assumed to be a completion message
exports.editingComplete = function(data){
  var obj = JSON.parse(data.toString('utf8'));
  if(obj.message == 'done'){
    emitter.emit('done');
  } else if(obj.message == 'done-recording'){
    emitter.emit('done-recording');
  }
};


// broadcast turntable events to the c++ interface
exports.turntableUpdate = function(data){
  var message = `${data.guid}|${data.input.name}|${data.value}`;
  if(tcpSocket) tcpSocket.write(message);
};
