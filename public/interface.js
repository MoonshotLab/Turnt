// # BROADCAST EVENTS
// countdown-complete   |   the countdown has completed
// contact-entered      |   someone entered their contact info


// setup a websocket client to consumer the live stream
var client = new WebSocket('ws://127.0.0.1:8084/');
var canvas = document.getElementById('live-preview');
var player = new jsmpeg(client, { canvas: canvas });

// keep track of state
var state  = 'ready';



$(function(){
  // listen for the phone number entry
  $('#phone-entry').keyup(function(e){
    var phoneNumber = $('#phone-entry').val();
    if(e.keyCode == 13){
      if(validator.isMobilePhone(phoneNumber, 'en-US')){
        socket.emit('contact-entered', phoneNumber);
      } else alert('not a phone number');
    }
  });
});



// listen to screen change events from the server
// BUT be responsible for managing own state
socket.on('screen', function(screen){
  if(state != 'countdown'){
    $('.state').hide();
    var selector = '.state.' + screen;
    $(selector).show();

    state = screen;
    if(screen == 'countdown') startCountdown();
    if(screen == 'contact') $('#phone-entry').focus();
  }
});



var startCountdown = function(){
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
    // manage state
    state = 'recording';

    socket.emit('countdown-complete');

    // update the ui
    $('.state.recording').show();
    $('.state.countdown').hide();

    // reset the countdown ui
    setTimeout(function(){ $('.countdown-screen').hide(); }, 100);
  }, 4500);
};
