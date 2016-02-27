// # ABOUT
// Talk to a goPro camera


// # BROADCAST EVENTS
// done-recording
//    the camera is done recording
//    returns the absolute file path of the recording location


var GoPro       = require('goproh4');
var gopro       = new GoPro.Camera();
var events      = require('events');
var config      = require('../config')();
var emitter     = new events.EventEmitter();
var liveStream  = new (require('ws').Server)({port: 8084});
exports.events  = emitter;



exports.setup = function(){
  gopro.mode(GoPro.Settings.Modes.Video, GoPro.Settings.Submodes.Video.Video)
    .then(function(){ return gopro.set(GoPro.Settings.VIDEO_RESOLUTION, GoPro.Settings.VideoResolution.R720); })
    .then(function(){ return gopro.set(GoPro.Settings.VIDEO_FPS, GoPro.Settings.VideoFPS.F240); })
    .then(function(){ return gopro.set(GoPro.Settings.VIDEO_FOV, GoPro.Settings.VideoFOV.Narrow); })
    .then(function(){ return gopro.set(GoPro.Settings.VIDEO_LOW_LIGHT, GoPro.Settings.VideoLowLight.OFF); })
    .then(function(){ return gopro.set(GoPro.Settings.SETUP_AUTO_POWER_DOWN, GoPro.Settings.SetupAutoPowerDown.Never); })
    .then(function(){ return gopro.set(GoPro.Settings.SETUP_AUTO_POWER_DOWN, GoPro.Settings.SetupAutoPowerDown.Never); })
    .then(function(){
      gopro.listMedia().then(function(a, b){
        console.log(a. b);
      });
    });
};


exports.record = function(){
  gopro.start()
    .delay(5000)
    .then(gopro.stop())
    .then(getLastRecording)
    .then(function(recordingLocation){
      emitter.emit('done-recording', recordingLocation);
      gopro.deleteAll();
    });
};


var getLastRecording = function(){
  return new Promise(function(resolve, reject){
    var directory = null;
    var filename  = null;

    gopro.listMedia().then(function(res){
      res.media.forEach(function(dir){
        directory = dir.d;
        filename  = dir.fs[dir.fs.length - 1].n;
      });

      var outputFile = new Date().getTime() + '.mp4';
      gopro.getMedia(directory, filename, outputFile).then(resolve);
    });
  });
};



exports.broadcastLastFrame = function(data, opts){
  for(var i in liveStream.clients) {
    if(liveStream.clients[i].readyState == 1){
      liveStream.clients[i].send(data, opts);
    }
    else{
      console.log( 'Error: Client ('+i+') not connected.' );
    }
  }
};


exports.startLiveStream = function(){
  gopro.restartStream().then(function(){

    liveStream.on('connection', function(socket) {
      var streamHeader = new Buffer(8);

      streamHeader.write('jsmp');
      streamHeader.writeUInt16BE(432, 4);
      streamHeader.writeUInt16BE(240, 6);
      socket.send(streamHeader, { binary:true });

      console.log( 'New WebSocket Connection ('+liveStream.clients.length+' total)' );

      socket.on('close', function(code, message){
        console.log( 'Disconnected WebSocket ('+liveStream.clients.length+' total)' );
      });
    });

    var ffmpeg = require('child_process').spawn('ffmpeg', [
  		'-f', 'mpegts',
  		'-i', 'udp://' + gopro._ip + ':8554',
  		'-f', 'mpeg1video',
  		'-b:v', '800k',
  		'-r', '30',
      'http://127.0.0.1:' + config.PORT + '/stream-image'
		]);

    ffmpeg.stdout.pipe(process.stdout);
    ffmpeg.stderr.pipe(process.stdout);
  });

};
