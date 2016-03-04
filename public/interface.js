// # BROADCAST EVENTS
// countdown-complete   |   the countdown has completed
// tutorial-done        |   the tutorial has been shown
// contact-entered      |   someone entered their contact info


// setup a websocket client to consumer the live stream
var client = new WebSocket('ws://127.0.0.1:8084/');
var canvas = document.getElementById('live-preview');
var player = new jsmpeg(client, { canvas: canvas });



// listen for the phone number entry
var attachContactEntryEvents = function(){
  $('#phone-entry').keyup(function(e){
    var phoneNumber = $('#phone-entry').val();
    if(e.keyCode == 13){
      if(validator.isMobilePhone(phoneNumber, 'en-US')){
        socket.emit('contact-entered', phoneNumber);
        changeState('gotit');
        $('#phone-entry').val('');
      } else alert('not a phone number');
    }
  });
};



// listen for end of video events
var attachVideoPlaybackEvents = function(){
  $('#video-tutorial')[0].addEventListener('ended', function(){
    socket.emit('tutorial-done');
  });
  $('#video-done')[0].addEventListener('ended', function(){
    changeState('contact');
  });
  $('#video-gotit')[0].addEventListener('ended', function(){
    socket.emit('ready');
    changeState('ready');
  });
};



// deal with the countdown
var startCountdown = function(){
  $('.countdown-screen.prep').show();

  $.ajax({
    url : '/prompt',
    success : function(prompt){
      $('.countdown-screen.prompt-a').css(
        'background-image', 'url(prompts/' + prompt.a + ')'
      );
      $('.countdown-screen.prompt-b').css(
        'background-image', 'url(prompts/' + prompt.b + ')'
      );
    }
  });

  setTimeout(function(){
    $('.countdown-screen.three').show();
  }, 2500);
  setTimeout(function(){
    $('.countdown-screen.two').show();
  }, 3500);
  setTimeout(function(){
    $('.countdown-screen.one').show();
  }, 4500);
  setTimeout(function(){
    $('.countdown-screen.prompt-a').show();
    socket.emit('countdown-complete');
  }, 5500);
  setTimeout(function(){
    $('.countdown-screen.prompt-b').show();
  }, 7500);
  // reset the countdown screen
  setTimeout(function(){
    $('.countdown-screen').hide();
  }, 30000);
};



// change the state
var changeState = function(state){
  // stop all the vidyas and put them back to original position
  $('video').each(function(i, vidya){
    vidya.pause();
    vidya.load();
  });

  // hide the current state, then show the next
  $('.state').hide();
  var selector = '.state.' + state;
  $(selector).show();

  // do whatever special thing this state needs
  switch(state){
    case 'ready':
      $('#video-ready')[0].play();
      break;
    case 'countdown':
      startCountdown();
      break;
    case 'tutorial':
      $('#video-tutorial')[0].play();
      break;
    case 'done':
      $('#video-done')[0].play();
      break;
    case 'gotit':
      $('#video-gotit')[0].play();
      break;
    case 'contact':
      $('#video-contact')[0].play();
      $('#phone-entry').focus();
      break;
  }
};



// listen to screen change events from the server
socket.on('screen', changeState);


$(function(){
  changeState('ready');
  attachContactEntryEvents();
  attachVideoPlaybackEvents();
});
