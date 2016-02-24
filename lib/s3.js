// # ABOUT
// Upload stuff to S3


var path      = require('path');
var knox      = require('knox');
var config    = require('../config')();
var s3Client  = knox.createClient({
  key     : config.S3_KEY,
  secret  : config.S3_SECRET,
  bucket  : config.S3_BUCKET
});



exports.remember = function(files){
  return new Promise(function(resolve, reject){

    var remotePaths = [];

    var putIt = function(file){
      var relativePath  = file.replace(process.cwd(), '');
      var extension     = path.extname(file);
      var remoteFile    = path.dirname(
        path.normalize(
          relativePath.replace('tmp', '')
        )).replace('/', '') + extension;

      var remotePath    = [
        'http://s3.amazonaws.com',
        config.S3_BUCKET,
        remoteFile
      ].join('/');

      // upload to s3
      s3Client.putFile(file, remoteFile, function(err, res){
        remotePaths.push(remotePath);

        // recurse or be done
        i++;
        if(files[i]) putIt(files[i]);
        else resolve(remotePaths);
      });
    };

    var i = 0;
    putIt(files[i]);

  });
};
