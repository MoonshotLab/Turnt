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
    playVideo(index, data.guid);
    resetInterval(index);
  }
});



// populate the videos, but delay so nothing plays in sync
setTimeout(function(){
  fetchVideo(0);
}, getRandomNumber(0, 3000));
setTimeout(function(){
  fetchVideo(1);
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
    fetchVideo(index);
  }, 30000);
}



function playVideo(index, guid){
  var interstitial = getRandomNumber(1, 2);
  $('video')[index].load();
  $('video')[index].src = '/interstitials/' + interstitial + '.mp4';
  $('video')[index].play();

	setTimeout(function(){
    $('video')[index].load();
		$('video')[index].src = '/' + guid + '/' + guid + '.mp4';
		$('video')[index].play();
	}, 2000);
}



// play a video from the showcase or pass in one and get it played
function fetchVideo(index){
  $.ajax({
    url : '/turnts?shuffle=true',
    success : function(results){
		if(results.length) playVideo(index, results[0]);
    }
  });
}



function getRandomNumber(lo, hi){
  return Math.floor(Math.random() * hi) + lo;
}
