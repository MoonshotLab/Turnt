// # ABOUT
// A controller for the openFrameworks c++ interface which allows
// participants to live edit video with fx


// # BROADCAST EVENTS
// editing-complete
//    the editing process has been completed
//    returns the absolute file path


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
  var editorPath  = path.join(config.TURNT_EDITOR_INTERFACE_PATH, 'Turnt-EditorInterfaceDebug.app');
  var command     = 'open ' + editorPath;
  cp.exec(command);
};


// any message received from the c++ interface is
// assumed to be a completion message
exports.editingComplete = function(data){
  var obj = JSON.parse(data.toString('utf8'));
  if(obj.message == 'done')
    emitter.emit('editing-complete', filePath);
};


// broadcast turntable events to the c++ interface
exports.turntableUpdate = function(input, value, guid){
  var message = `${guid}|${input.name}|${value}`;
  if(tcpSocket) tcpSocket.write(message);
};
