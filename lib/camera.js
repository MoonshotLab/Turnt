// # ABOUT
// Talk to a usb camera


// # BROADCAST EVENTS
// done-recording
//    the camera is done recording
//    returns the absolute file path of the recording location


var events      = require('events');
var path        = require('path');
var config      = require('../config')();
var emitter     = new events.EventEmitter();
var liveStream  = new (require('ws').Server)({port: 8084});
var ffmpeg      = null;
exports.events  = emitter;




exports.record = function(){
  if(ffmpeg) ffmpeg.kill();

  var outFile = path.join(
    config.TURNT_EDITOR_INTERFACE_PATH,
    'data', 'recording.mp4'
  );

  ffmpeg = require('child_process').spawn('ffmpeg', [
    '-f', 'avfoundation',
    '-video_device_index', '0',
    '-s', '1280x720',
    '-t', '00:00:05',
    '-r', '30',
    '-i', 'default',
    '-f', 'mp4',
    '-pix_fmt', 'yuv420p',
    outFile,
    '-y'
  ]);

  ffmpeg.stdout.pipe(process.stdout);
  ffmpeg.stderr.pipe(process.stdout);

  setTimeout(function(){
    emitter.emit('done-recording');
  }, 7000);
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
  streamHeader.writeUInt16BE(1280, 4);
  streamHeader.writeUInt16BE(720, 6);
  socket.send(streamHeader, { binary:true });
});


var startLiveStream = function(){

  if(ffmpeg) ffmpeg.kill();

  ffmpeg = require('child_process').spawn('ffmpeg', [
    '-f', 'avfoundation',
    '-video_device_index', '0',
    '-s', '1280x720',
    '-r', '30',
    '-i', 'default',
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
};


exports.startLiveStream = startLiveStream;
