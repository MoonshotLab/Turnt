// # ABOUT
// stuff...

var cp        = require('child_process');
var config    = require('../config')();



exports.notifyRemoteWebService = function(data){

};


// send a user a text message
// data : {
//    phoneNumber : +181655512345
//    webUrl      : http://joelongstreet.com/12345
// }
exports.sendTextMessage = function(data){

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
