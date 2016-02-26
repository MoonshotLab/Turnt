// # ABOUT
// stuff...

var cp        = require('child_process');
var config    = require('../config')();
var needle    = require('needle');



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



exports.launchGUI = function(){
  if(config.KIOSK_POWERSHELL_PATH){
    var child = cp.spawn('powershell.exe', [config.KIOSK_POWERSHELL_PATH]);
    child.stdin.end();
  }
};



// join a new wifi network
// network : 'gopro' || 'wifi'
exports.joinWifi = function(network){
  return new Promise(function(resolve, reject){
    var username  = config.WIFI_USERNAME;
    var password  = config.WIFI_PASSWORD;

    if(network == 'gopro'){
      username = config.GOPRO_USERNAME;
      password = config.GOPRO_PASSWORD;
    }

    var command = [
      'python',
      './scripts/join-wireless.py',
      username, password
    ].join(' ');

    var child = cp.exec(command);
    child.on('exit', function(code){
      if(code === 0) resolve();
      else reject();
    });
  });
};
