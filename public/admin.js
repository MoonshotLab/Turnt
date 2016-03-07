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
  var path  = '/' + guid + '/' + guid;
  var id    = 'turnt-' + guid;

  var turnt = [
    '<div class="turnt" id="' + id + '" >',
      '<a class="delete" href="#">x</a>',
      '<video loop controls=true poster="' + path + '.jpg">',
        '<source src="' + path + '.mp4 "/>',
      '</video>',
    '<div>'
  ].join('');

  $('.turnts').append(turnt);

  setTimeout(function(){
    $('#' + id).find('a').click(function(e){
      e.preventDefault();
      deleteTurnt(guid);
    });
  }, 100);
};


socket.on('debug', function(text){
  if(displayOptions.screen == 1) $('#debug').text(text);
});
