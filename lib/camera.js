// # ABOUT
// Talk to a usb camera


// # BROADCAST EVENTS
// done-recording
//    the camera is done recording
//    returns the absolute file path of the recording location


var events      = require('events');
var path        = require('path');
var utils       = require('./utils');
var cp          = require('child_process');
var config      = require('../config')();
var emitter     = new events.EventEmitter();
var liveStream  = new (require('ws').Server)({port: 8084});
var ffmpeg      = null;
exports.events  = emitter;


// different input and video devices for different OS's
var inputDevice = 'avfoundation';
var videoDevice = ['-video_device_index', '0'];

if(utils.isWindows){
  inputDevice = 'dshow';
  videoDevice = ['-i', 'video=Logitech HD Pro Webcam C920'];
}


exports.record = function(){
  killProcess();

  var outFile = path.join(
    config.TURNT_EDITOR_INTERFACE_PATH,
    'data', 'recording.mp4'
  );

  ffmpeg = require('child_process').spawn('ffmpeg', [
    '-f', inputDevice,
    videoDevice[0], videoDevice[1],
    '-s', '960x720',
    '-b:v', '700k',
    '-r', '30',
    '-f', 'mp4',
    '-t', '00:00:07',
    outFile,
    '-y'
  ]);

  //ffmpeg.stdout.pipe(process.stdout);
  //ffmpeg.stderr.pipe(process.stdout);

  ffmpeg.on('exit', function(){
    emitter.emit('done-recording');
  });
};



exports.broadcastLastFrame = function(data){
  if(liveStream.clients.length){
    if(liveStream.clients[0].readyState == 1){
      liveStream.clients[0].send(data, { binary : true });
    }
  }
};


liveStream.on('connection', function(socket) {
  var streamHeader = new Buffer(8);

  streamHeader.write('jsmp');
  streamHeader.writeUInt16BE(960, 4);
  streamHeader.writeUInt16BE(720, 6);
  socket.send(streamHeader, { binary:true });
});


var startLiveStream = function(){
  killProcess();

  ffmpeg = cp.spawn('ffmpeg', [
    '-f', inputDevice,
    videoDevice[0], videoDevice[1],
    '-s', '960x720',
    '-b:v', '1500k',
    '-r', '30',
    '-rtbufsize', '2000M',
    '-pix_fmt', 'yuv420p',
    '-f', 'mpeg1video',
    'http://127.0.0.1:' + config.PORT + '/stream-image',
    '-y'
  ]);

  ffmpeg.stderr.on('data', function(buffer){
    var message = new Buffer(buffer).toString('utf8');
    if(message.indexOf('Conversion failed!') != -1){
      startLiveStream();
    }
  });

  //ffmpeg.stdout.pipe(process.stdout);
  //ffmpeg.stderr.pipe(process.stdout);
};



var killProcess = function(){
  if(ffmpeg){
    if(!utils.isWindows){
      if(ffmpeg) ffmpeg.kill();
    } else{
      cp.spawn('taskkill', ['/pid', ffmpeg.pid, '/f', '/t']);
    }
  }
};


exports.startLiveStream = startLiveStream;
exports.killProcess = killProcess;
