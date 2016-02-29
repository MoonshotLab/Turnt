var path    = require('path');
var camera  = require('./camera');
var dirty   = require('dirty');
var utils   = require('./utils');
var dirty   = require('dirty')('turnt.db');


exports.interface = function(req, res){
  var filePath = path.join(process.cwd(), 'public', 'interface.html');
  res.sendFile(filePath);
};


exports.streamImage = function(req, res){
  req.on('data', function(data){
    camera.broadcastLastFrame(data);
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
