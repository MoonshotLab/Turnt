// # BROADCAST EVENTS
// state-chage          |   the countdown has completed
// contact-entered      |   someone entered their contact info
// ready                |   flow is complete


// setup a websocket client to consumer the live stream
var client = new WebSocket('ws://127.0.0.1:8084/');
var canvas = document.getElementById('live-preview');
var player = new jsmpeg(client, { canvas: canvas });



// listen for the phone number entry
var attachContactEntryEvents = function(){
  $('#phone-entry').keydown(function(e){
    if(e.keyCode == 187){
      e.preventDefault();
      $('#phone-entry').val( $('#phone-entry').val().slice(0,-1) );
    }
  });

  $('#phone-entry').keyup(function(e){
    var phoneNumber = $('#phone-entry').val();
    if(e.keyCode == 13){
      if(validator.isMobilePhone(phoneNumber, 'en-US')){
        if(phoneNumber.length == 10) phoneNumber = '1' + phoneNumber;
        socket.emit('contact-entered', phoneNumber);
        changeState('gotit');
      } else{
        $('#error-message').addClass('show');
        setTimeout(function(){
          $('#error-message').removeClass('show');
        }, 2000);
      }
    }
  });
};



// listen for end of video events
var attachVideoPlaybackEvents = function(){
  $('#video-review')[0].addEventListener('ended', function(){
    changeState('contact');
  });
  $('#video-gotit')[0].addEventListener('ended', function(){
    setTimeout(function(){
      socket.emit('ready');
      changeState('ready');
    }, 1000);
  });
};



// deal with the countdown
var startCountdown = function(){
  $('.countdown-screen.prep').addClass('show');

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
    $('.countdown-screen').removeClass('show');
    $('.countdown-screen.three').addClass('show');
  }, 2500);
  setTimeout(function(){
    $('.countdown-screen').removeClass('show');
    $('.countdown-screen.two').addClass('show');
  }, 3500);
  setTimeout(function(){
    $('.countdown-screen').removeClass('show');
    $('.countdown-screen.one').addClass('show');
  }, 4500);
  setTimeout(function(){
    $('.countdown-screen').removeClass('show');
    $('.countdown-screen.prompt-a').addClass('show');
    socket.emit('countdown-complete');
  }, 5500);
  setTimeout(function(){
    $('.countdown-screen').removeClass('show');
    $('.countdown-screen.prompt-b').addClass('show');
  }, 9000);
  setTimeout(function(){
    $('.countdown-screen').removeClass('show');
  }, 20000);
};



// change the state
var changeState = function(state){
  // stop all the vidyas and put them back to original position
  $('video').each(function(i, vidya){
    vidya.pause();
  });

  // hide the current state, then show the next
  $('.state').removeClass('show');
  var selector = '.state.' + state;
  $(selector).addClass('show');

  // hide the hanging tel field
  $('#phone-entry').hide();

  // do whatever special thing this state needs
  switch(state){
    case 'ready':
      $('#phone-entry').val('');
      $('video').each(function(i, vidya){
        vidya.pause();
      });
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
    case 'review':
      var filePath = '/assembled-frames.mp4?cacheBust=' + new Date().getTime();
      $('#video-review-source')[0].src = filePath;
      $('#video-review')[0].load();
      setTimeout(function(){ $('#video-review')[0].play(); }, 250);
      break;
    case 'contact':
      $('#video-contact')[0].play();
      $('#phone-entry').show();
      $('#phone-entry').focus();
      break;
    case 'gotit':
      $('#video-gotit')[0].play();
      break;
  }

  socket.emit('state-change', state);
};



// listen to screen change events from the server
socket.on('screen', changeState);


$(function(){
  changeState('ready');
  attachContactEntryEvents();
  attachVideoPlaybackEvents();
});
