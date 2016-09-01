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
var Jimp        = require('jimp');
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
    '-framerate 20',
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
    }, 250);
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
      function(next){ addOverlay(     guid, outPath,  next); },
      function(next){ renameVideo(    guid, outPath,  next); },
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
    setTimeout(next, 100);
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

  var logoPath = path.join(
    process.cwd(),
    'public',
    'logos',
    'take5-thrillist.png'
  );

  fs.readdir(inPath, function(err, res){
    var posterPath = path.join(inPath, res[Math.round(res.length/2)]);

    Jimp.read(posterPath).ther(function(image) {
      image
        .composite(logoPath, 686, 684)
        .write(outFile);
    }).catch(function(err) {
      throw err;
    });


    // convert /tmp/1472576437556.jpg ./public/logos/take5-thrillist.png -geometry +686+684 -composite /tmp/overlay.jpg
    // var command = [
    //   'magick',
    //   'convert',
    //   posterPath,
    //   logoPath,
    //   '-geometry',
    //   '+686+684',
    //   '-composite',
    //   outFile
    // ].join(' ');

    // try {
    //   cp.exec(command, next);
    // }

    // catch {
    //   fs.rename(posterPath, outFile, next);
    // }

    fs.rename(posterPath, outFile, next);

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



// Add logo overlay
var addOverlay = function(guid, outPath, next){
  display.debug('Adding overlay...');

  var inFile  = path.join(outPath, guid + '.mp4');
  var outFile  = path.join(outPath, guid + '-watermark.mp4');
  var logoPath = path.join(
    process.cwd(),
    'public',
    'logos',
    'take5-thrillist.png'
  );

  // ffmpeg -i /tmp/turnt.mp4 -i /tmp/watermark.png -filter_complex "overlay=x=(main_w-overlay_w-20):y=(main_h-overlay_h-10)" /tmp/turnt-watermark.mp4
  var command = [
    'ffmpeg',
    '-i',
    inFile,
    '-i',
    logoPath,
    '-filter_complex',
    '"overlay=x=(main_w-overlay_w-20):y=(main_h-overlay_h-10)"',
    outFile,
    '-y'
  ].join(' ');

  cp.exec(command, next);
}

// Rename the watermarked file
var renameVideo = function(guid, outPath, next){
  display.debug('Renaming...');

  var inFile  = path.join(outPath, guid + '-watermark.mp4');
  var outFile  = path.join(outPath, guid + '.mp4');

  fs.rename(inFile, outFile, function(){
    setTimeout(next, 100);
  });
}



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
