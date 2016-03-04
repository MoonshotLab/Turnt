var refetchIntervals = [null, null];
var displayOptions   = {};

$(function(){
  // different mointors have different screen arangements
  // for the showcase videos
  var query   = window.location.search;
  var params  = query.slice(1, query.length).split('&');

  params.forEach(function(param){
    var splits = param.split('=');
    displayOptions[splits[0]] = splits[1];
  });

  $('body').addClass('screen-' + displayOptions.screen);
});


// listen for incoming videos
socket.on('new-video', function(data){
  if(data.screen == displayOptions.screen){
    var index = getRandomNumber(0, 2);
    playRandomVideo(index);
    resetInterval(index);
  }
});


// listen for messages from the debugger
socket.on('debug', function(text){
  if(displayOptions.screen == 1) $('debug').text(text);
});



// populate the videos, but delay so nothing plays in sync
setTimeout(function(){
  playRandomVideo(0);
}, getRandomNumber(0, 3000));
setTimeout(function(){
  playRandomVideo(1);
}, getRandomNumber(1000, 10000));

// setup intervals to refetch videos
resetInterval(0);
setTimeout(function(){
  resetInterval(1);
}, getRandomNumber(1000, 6000));



// reset the interval for a showcase video evey 30 seconds
function resetInterval(index){
  if(refetchIntervals[index]) clearInterval(refetchIntervals[index]);

  refetchIntervals[index] = setInterval(function(){
    playRandomVideo(index);
  }, 30000);
}



// play a video from the showcase
function playRandomVideo(index){
  $.ajax({
    url : '/showcase?shuffle=true',
    success : function(results){
      if(results.length){
	      $($('.video-player')[index]).addClass('hide');
	      setTimeout(function(){
	        $('video')[index].src = results[0] + '.mp4';
	        $('video')[index].play();
	        $($('.video-player')[index]).removeClass('hide');
	      }, 500);
  	  }
    }
  });
}



function getRandomNumber(lo, hi){
  return Math.floor(Math.random() * hi) + lo;
}
