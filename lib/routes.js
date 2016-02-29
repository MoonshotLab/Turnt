var path    = require('path');
var gopro   = require('./gopro');
var dirty   = require('dirty');
var utils   = require('./utils');
var dirty   = require('dirty')('turnt.db');


exports.interface = function(req, res){
  var filePath = path.join(process.cwd(), 'public', 'interface.html');
  res.sendFile(filePath);
};


exports.streamImage = function(req, res){
  req.on('data', function(data){
    gopro.broadcastLastFrame(data, { binary : true });
  });
};


exports.showcase = function(req, res){
  var vidyas = [];
  dirty.forEach(function(key, val){
    vidyas.push(path.join('/', key, val));
  });

  if(req.query.shuffle) utils.shuffle(vidyas);

  res.send(vidyas);
};


exports.showcaseView = function(req, res){
  var filePath = path.join(process.cwd(), 'public', 'showcase.html');
  res.sendFile(filePath);
};
