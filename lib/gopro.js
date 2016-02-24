// # ABOUT
// Talk to a goPro camera


// # BROADCAST EVENTS
// done-recording
//    the camera is done recording
//    returns the absolute file path of the recording location


var GoPro       = require('goproh4');
var gopro       = new GoPro.Camera();
var events      = require('events');
var emitter     = new events.EventEmitter();
exports.events  = emitter;



exports.setup = function(){
  gopro.mode(GoPro.Settings.Modes.Video, GoPro.Settings.Submodes.Video.Video)
    .then(function(){ return gopro.set(GoPro.Settings.VIDEO_RESOLUTION, GoPro.Settings.VideoResolution.R720); })
    .then(function(){ return gopro.set(GoPro.Settings.VIDEO_FPS, GoPro.Settings.VideoFPS.F120); })
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
