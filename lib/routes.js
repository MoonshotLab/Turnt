var gopro   = require('./gopro');
var dirty   = require('dirty');
var utils   = require('./utils');
var dirty   = require('dirty')('turnt.db');


exports.interface = function(req, res){
  res.render('interface');
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
  res.render('showcase');
};
