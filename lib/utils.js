// # ABOUT
// stuff...

var cp        = require('child_process');
var config    = require('../config')();
var needle    = require('needle');
var path      = require('path');
var ping      = require('ping');



// s3Id   : the s3 id connecting the mp4, webm, and poster
// phone  : a phone number to use as text receiver
exports.notifyRemoteWebService = function(data, next){
  var earl = [
    config.SERVER_URL,
    '/turnt/new?',
    's3Id='   + data.s3Id,
    '&phone=' + data.phone,
    '&key='   + config.TURNT_KEY
  ].join('');

  needle.post(earl, next);
};



// launch a series of kiosked browser windows on a series of monitors
exports.launchGUI = function(){
  if(config.KIOSK_POWERSHELL_PATH){
    var child = cp.spawn('powershell.exe', [config.KIOSK_POWERSHELL_PATH]);
    child.stdin.end();
  }
};



// shuffle an array
exports.shuffle = function(o){
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};
