var path      = require('path');
var events    = require('events');
var config    = require('./config')();
var emitter   = new events.EventEmitter();
var camera    = require('./lib/camera');
var cp        = require('child_process');
var webSocket = null;
var tcpSocket = null;



// # SOCKET SETUP
exports.setWebSocket = function(socket){ webSocket = socket; };
exports.setTcpSocket = function(socket){ tcpSocket = socket; };



// # EVENT BUS MESSAGES
exports.launchEditor = function(){
  var editorPath  = path.join(config.TURNT_EDITOR_INTERFACE_PATH, 'Turnt-EditorInterfaceDebug.app');
  var command     = 'open ' + editorPath;
  cp.exec(command);
};




// # WEB PAGE INTERFACE
exports.initializeWebpageEvents = function(socket){

  // listen for countdown completion from the client before recording
  socket.on('countdown-done', function(){
    setTimeout(function(){
      camera.takeVideo();
    }, 500);
  });
};




// # TURNTABLE INTERFACE
exports.turntableUpdate = function(input, value, guid){
  var message = `${guid}|${input.name}|${value}`;
  if(tcpSocket) tcpSocket.write(message);
};


exports.editingComplete = function(data){
  var obj = JSON.parse(data.toString('utf8'));
  if(obj.message == 'done')
    emitter.emit('editing-complete', filePath);
};




// # WIFI
exports.joinWifi = function(network, next){
  var username  = config.WIFI_USERNAME;
  var password  = config.WIFI_PASSWORD;

  if(network == 'gopro'){
    username = config.GOPRO_USERNAME;
    password = config.GOPRO_PASSWORD;
  }

  var command = [
    'python',
    './scripts/join-wireless.py',
    username, password
  ].join(' ');

  var child = cp.exec(command);
  child.on('exit', function(code){
    if(code === 0)
      emitter.emit('wifi-joined', { network : network });

    if(next) next(code, null);
  });
};



exports.events = emitter;
