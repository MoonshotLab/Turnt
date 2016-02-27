var gopro = require('./gopro');


exports.interface = function(req, res){
  res.render('interface');
};


exports.streamImage = function(req, res){
  req.on('data', function(data){
    gopro.broadcastLastFrame(data, { binary : true });
  });
};
