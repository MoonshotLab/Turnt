var path    = require('path');
var cp      = require('child_process');
var config  = require('../config')();


exports.assembleFrames = function(){
  var dataPath = path.join(
    config.TURNT_EDITOR_INTERFACE_PATH,
    'data',
    'recording',
    'frame_%04d.jpg'
  );

  var command = [
    'ffmpeg',
    '-framerate 30',
    '-i',
    dataPath,
    '-c:v libx264',
    '-r 30',
    '-pix_fmt yuv420p',
    'out.mp4',
    '-y'
  ].join(' ');

  cp.exec(command, function(err, message){
    if(!err) {} // TODO: do something
  });
};
