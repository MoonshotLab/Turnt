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
  var moviePath = '/' + guid + '/' + guid + '.mp4';
  var turnt = [
    '<div class="turnt" id="turnt-' + guid + '" >',
      '<a class="delete" href="#" onclick=deleteTurnt("' + guid + '")>✖</a>',
      '<video loop controls=true>',
        '<source src="' + moviePath + ' "/>',
      '</video>',
    '<div>'
  ].join('');

  $('.turnts').append(turnt);
};
