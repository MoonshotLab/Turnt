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




// # CAMERA EVENTS
exports.cameraConnected = function(){
  console.log('camera connected');
  webSocket.sockets.emit('camera', {
    status : 'ready', humanTitle : 'Camera Ready'
  });
  camera.startLiveView();
};


exports.cameraRecording = function(){
  webSocket.sockets.emit('camera', {
    status : 'recording', humanTitle : 'Camera Recording'
  });
};


exports.cameraDoneRecording = function(){
  // create an output directory with random id
  var id = new Date().getTime().toString();
  var outputDir = path.join(process.cwd(), 'tmp', id);
  fs.mkdirSync(outputDir);

  // timeout is necessary to give the camera enough time to "stop recording"
  setTimeout(function(){

    // tell the client we're done recording
    io.sockets.emit('camera', {
      status : 'done-recording', humanTitle : 'Camera Done Recording'
    });

    camera.writeLastVideoToDisk(outputDir, function(filePath){
      // let everyone know we're done downloading the file
      emitter.emit('video-downloaded', filePath);

      // restart the live view and tell the client
      camera.startLiveView();
      io.sockets.emit('camera', {
        status : 'ready', humanTitle : 'Camera Ready'
      });

    });
  }, 2500);
};




// # EVENT BUS MESSAGES
exports.launchEditor = function(){
  var command = 'open ' + config.TURNT_EDITOR_INTERFACE_PATH;
  var child = cp.exec(command);
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


exports.events = emitter;
