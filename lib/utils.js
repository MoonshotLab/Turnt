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

    var scriptPath = path.join(process.cwd(), '/scripts/join-wireless.py');
    var command    = ['python', scriptPath, username, password].join(' ');

    // recursively check internet connection before replying
    // with the promise resolution
    cp.exec(command).on('exit', function(code){
      if(code === 0){
        if(network == 'gopro') resolve();
        else testInternetConnection(resolve);
      } else reject();
    });
  });
};


var testInternetConnection = function(next){
  ping.sys.probe('google.com', function(isAlive){
    if(!isAlive){
      setTimeout(function(){
        testInternetConnection(next);
      }, 1000);
    } else next();
  });
};
