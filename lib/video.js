// # ABOUT
// An ffmpeg video editor, assembles frames into a video


// # BROADCAST EVENTS
//
// ready-to-showcase
//    ready to be shown on the showcase
// asssembled
//    returns the output path of the video


var fs          = require('fs');
var async       = require('async');
var events      = require('events');
var emitter     = new events.EventEmitter();
var path        = require('path');
var utils       = require('./utils');
var display     = require('./display');
var cp          = require('child_process');
var s3          = require('./s3');
var config      = require('../config')();
exports.events  = emitter;



// assembles the frames from the editor interface
exports.assemble = function(){

  var framesPath = path.join(
    config.TURNT_EDITOR_INTERFACE_PATH,
    'data',
    'recording'
  );

  var outPath = path.join(
    process.cwd(),
    'tmp',
    'assembled-frames.mp4'
  );

  var command = [
    'ffmpeg',
    '-framerate 30',
    '-i',
    path.join(framesPath, 'frame_%04d.jpg'),
    '-c:v libx264',
    '-r 15',
    '-pix_fmt yuv420p',
    outPath,
    '-y'
  ].join(' ');

  cp.exec(command, function(err, message){
    // give it some time to "actually finish"
    setTimeout(function(){
      emitter.emit('assembled', outPath);
    }, 500);
  });
};



// this just assumes everything works and gets stuffed
// in the correct directory
// phone = 18165512345
exports.process = function(phone){
  var guid      = new Date().getTime().toString();
  var outPath   = path.join(process.cwd(), 'tmp/', guid);

  return new Promise(function(resolve, reject){
    async.series([
      function(next){ fs.mkdir(       outPath,        next); },
      function(next){ moveFile(       guid, outPath,  next); },
      function(next){ makePoster(     guid, outPath,  next); },
      function(next){ makeWebM(       guid, outPath,  next); },
      function(next){ uploadToS3(     guid, outPath,  next); },
      function(next){
        display.debug('Notifying remote web service...');
        utils.notifyRemoteWebService({
          s3Id  : guid,
          phone : phone
        }, next);
      },
    ],
    function(){ resolve(guid); });
  });
};



// deletes frames from the last recording
var cleanFrames = function(next){
  var framesPath = path.join(
    config.TURNT_EDITOR_INTERFACE_PATH,
    'data',
    'recording'
  );

  // clean up frames from last recording
  fs.readdir(framesPath, function(err, files){
    files.forEach(function(file){
      var filePath = path.join(framesPath, file);
      fs.unlink(filePath);
    });
  });

  if(next) next();
};



// moves the temporary file into it's respective directory
var moveFile = function(guid, outPath, next){
  display.debug('Moving files...');

  var inFile = path.join(
    process.cwd(),
    'tmp',
    'assembled-frames.mp4'
  );

  var outFile = path.join(
    outPath,
    guid + '.mp4'
  );

  fs.rename(inFile, outFile, function(){
    emitter.emit('ready-to-showcase', guid);
    next();
  });
};



// grabs a frame from the editing process
var makePoster = function(guid, outPath, next){
  display.debug('Making poster...');

  var inPath = path.join(
    config.TURNT_EDITOR_INTERFACE_PATH,
    'data',
    'recording'
  );

  var outFile = path.join(outPath, guid + '.jpg');

  fs.readdir(inPath, function(err, res){
    var posterImage = path.join(inPath, res[Math.round(res.length/2)]);
    fs.rename(posterImage, outFile, next);
  });
};



// makes a webM file for Android users
var makeWebM = function(guid, outPath, next){
  display.debug('Making a WebM Version...');

  var inFile  = path.join(outPath, guid + '.mp4');
  var outFile = path.join(outPath, guid +'.webm');

  var command = [
    'ffmpeg',
    '-i',
    inFile,
    '-c:v libvpx -crf 10 -b:v 1M -c:a libvorbis',
    outFile,
    '-y'
  ].join(' ');

  cp.exec(command, next);
};



var uploadToS3 = function(guid, outPath, next){
  display.debug('Uploading to S3...');

  fs.readdir(outPath, function(err, res){
    var files = [];
    res.forEach(function(file){
      files.push(path.join(outPath, file));
    });

    s3.remember(guid, files).then(next);
  });
};



exports.cleanFrames = cleanFrames;
