var fs      = require('fs');
var path    = require('path');
var camera  = require('./camera');
var dirty   = require('dirty');
var utils   = require('./utils');
var prompts = require('./prompts');
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


exports.turnts = function(req, res){
  var vidyas = [];
  dirty.forEach(function(key, val){
    if(val) vidyas.push(val);
  });

  if(req.query.shuffle) utils.shuffle(vidyas);

  res.send(vidyas);
};


exports.showcase = function(req, res){
  var filePath = path.join(process.cwd(), 'public', 'showcase.html');
  res.sendFile(filePath);
};


exports.getPrompt = function(req, res){
  var randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  res.send(randomPrompt);
};


exports.admin = function(req, res){
  var filePath = path.join(process.cwd(), 'public', 'admin.html');
  res.sendFile(filePath);
};


exports.deleteTurnt = function(req, res){
  dirty.rm(req.params.id, function(){
    res.send('ok');
  });
};
