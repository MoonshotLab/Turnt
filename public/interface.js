// # BROADCAST EVENTS
// countdown-complete   |   the countdown has completed
// contact-entered      |   someone entered their contact info


// setup a websocket client to consumer the live stream
var client = new WebSocket('ws://127.0.0.1:8084/');
var canvas = document.getElementById('live-preview');
var player = new jsmpeg(client, { canvas: canvas });



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

  // listen for the end of the tutorial video
  $('#tutorial-video')[0].onEnded = function(){
    socket.emit('tutorial-done');
  };
});



// listen to screen change events from the server
// BUT be responsible for managing own state
socket.on('screen', function(screen){
  $('.state').hide();
  var selector = '.state.' + screen;
  $(selector).show();

  if(screen == 'countdown') startCountdown();
  if(screen == 'tutorial') startTutorial();
  if(screen == 'contact') $('#phone-entry').focus();
});



var startTutorial = function(){
  $('#tutorial-video')[0].play();
};



var startCountdown = function(){
  $('.countdown-screen.prep').show();

  $.ajax({
    url : '/prompt',
    success : function(image){
      $('.countdown-screen.prompt').css(
        'background-image', 'url(prompts/' + image + ')'
      );
    }
  });

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
    $('.countdown-screen.prompt').show();
  }, 4500);
  setTimeout(function(){
    // tell the server we're done
    socket.emit('countdown-complete');

    // reset the countdown ui
    setTimeout(function(){ $('.countdown-screen').hide(); }, 100);
  }, 5500);
};
