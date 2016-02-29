$(function(){
  // different mointors have different screen arangements
  // for the showcase videos
  var query   = window.location.search;
  var params  = query.slice(1, query.length).split('&');

  $('body').addClass('screen-' + params.screen);

  playRandomVideo();
  setTimeout(playRandomVideo, 15000);
});



// play a video from the showcase
var playRandomVideo = function(){
  $.ajax({
    url : '/showcase?shuffle=true',
    success : function(results){
      $('.video-one video')[0].src = results[0];
      $('.video-two video')[0].src = results[1];

      $('.video-one video')[0].play();
      $('.video-two video')[0].play();
    }
  });
};
