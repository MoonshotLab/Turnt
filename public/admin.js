$(function(){
  $.ajax({
    url : '/turnts',
    success : function(results){
      results.forEach(addToDom);
    }
  });
});


var deleteTurnt = function(guid){
  $.ajax({
    url : '/turnt/delete/' + guid,
    success : function(results){
      $('#turnt-' + guid).remove();
    }
  });
};


var addToDom = function(guid){
  var path = '/' + guid + '/' + guid;
  var turnt = [
    '<div class="turnt" id="turnt-' + guid + '" >',
      '<a class="delete" href="#" onclick=deleteTurnt("' + guid + '")>x</a>',
      '<video loop controls=true poster="' + path + '.jpg">',
        '<source src="' + path + '.mp4 "/>',
      '</video>',
    '<div>'
  ].join('');

  $('.turnts').append(turnt);
};


socket.on('debug', function(text){
  if(displayOptions.screen == 1) $('#debug').text(text);
});
