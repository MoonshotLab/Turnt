var GoPro     = require('goproh4');
var gopro     = new GoPro.Camera();
var events    = require('events');
var emitter   = new events.EventEmitter();


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
    .then(function(){
      console.log('all done');
    });
};



exports.clearSDCard = function(){
  gopro.deleteAll().then(function(){

  });
};



exports.getLastRecording = function(){
  var directory = null;
  var filename  = null;

  gopro.listMedia().then(function(res){
    res.media.forEach(function(dir){
      directory = dir.d;
      filename  = dir.fs[dir.fs.length - 1].n;
    });

    gopro.getMedia(directory, filename, 'output.mp4');
  });
};



exports.events = emitter;
