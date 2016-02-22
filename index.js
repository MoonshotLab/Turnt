var net = require('net');
var turntable = require('./lib/turntable')();
var socket;


// setup a tcp server
var server = net.createServer(function(sock) {
  console.log('tcp client connected');
  socket = sock;
  socket.pipe(socket);
});

server.listen(3000, '127.0.0.1');



// listen to updates from the turntable, then send over via socket
turntable.on('input-update', function(input, value, guid){
  var message = `${guid}|${input.name}|${value}`;
  if(socket) socket.write(message);
});
