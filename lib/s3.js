// # ABOUT
// Upload stuff to S3


var path      = require('path');
var knox      = require('knox');
var async     = require('async');
var config    = require('../config')();
var s3Client  = knox.createClient({
  key     : config.S3_KEY,
  secret  : config.S3_SECRET,
  bucket  : config.S3_BUCKET
});



exports.remember = function(guid, files){

  return new Promise(function(resolve, reject){

    async.eachSeries(files, function(file, next){
      var remoteFile = guid + path.extname(file);
      s3Client.putFile(file, remoteFile, next);
    }, resolve);

  });
};
