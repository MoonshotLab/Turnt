// # ABOUT
// An ffmpeg video editor, assembles frames into a video


// # BROADCAST EVENTS
// video-asssembled
//    the jog wheel or slide pot is updated
//    returns { input : 'jog-wheel' || 'slide', value : number,  guid  : timeStamp}


var events      = require('events');
var emitter     = new events.EventEmitter();
var path        = require('path');
var cp          = require('child_process');
var s3          = require('./s3');
var config      = require('../config')();
exports.events  = emitter;


// TODO: this needs to do the following
// 1. assemble the frames into a video
// 2. pull a frame as the poster
// 3. Make both an .mp4 and a .webm video
exports.process = function(){
  var dataPath = path.join(
    config.TURNT_EDITOR_INTERFACE_PATH,
    'data',
    'recording',
    'frame_%04d.jpg'
  );

  // TODO: the absolute path of the done video
  var videoPath   = '';
  // TODO: the absolute path of a poster for the video
  var posterPath  = '';

  var command = [
    'ffmpeg',
    '-framerate 30',
    '-i',
    dataPath,
    '-c:v libx264',
    '-r 30',
    '-pix_fmt yuv420p',
    videoPath,
    '-y'
  ].join(' ');

  cp.exec(command, function(err, message){
    if(!err)
      emitter.emit('video-asssembled', {
        videoPath   : videoPath,
        posterPath  : posterPath
      });
  });
};



exports.upload = function(){
  // utils.notifyRemoteWebService
  // utils.sendTextMessage
};
