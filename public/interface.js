// # BROADCAST EVENTS
// countdown-complete  |  the countdown has completed


// setup a websocket client to consumer the live stream
var client = new WebSocket('ws://127.0.0.1:8084/');
var canvas = document.getElementById('video-canvas');
var player = new jsmpeg(client, { canvas: canvas });


// listen to the camera
socket.on('camera', function(data){
  switch(data.status){
    case 'ready':
      changeState(data.status);
      break;
    case 'connected':
      break;
    case 'recording':
      changeState(data.status);
      break;
    case 'done-recording':
      changeState('done');
      setTimeout(function(){ changeState('processing'); }, 4000);
      break;
    case 'live-feed-update':
      var query = new Date().getTime();
      var path  = '/live-feed.jpg?bust=' + query;
      $('.live-feed').attr('src', path);
      break;
  }
});



var startCountdown = function(){
  changeState('countdown');
  $('.ui-container').removeClass('hide');

  $('.countdown-screen.prep').show();

  // countdown
  setTimeout(function(){
    $('.countdown-screen.three').show();
  }, 1500);
  setTimeout(function(){
    $('.countdown-screen.two').show();
  }, 2500);
  setTimeout(function(){
    $('.countdown-screen.one').show();
  }, 3500);
  setTimeout(function(){
    socket.emit('countdown-complete');
  }, 4500);

  // reset the countdown ui
  setTimeout(function(){
    $('.countdown-screen').hide();
  }, 10000);
};



var changeState = function(state){
  $('.state').hide();
  $('li.option').removeClass('highlight');
  var selector = '.state.' + state;
  $(selector).show();
};
