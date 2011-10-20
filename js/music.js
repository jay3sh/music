
google.load('search', '1');

function skin_init(){
  var width = ($(document).width()>1280 ? $(document).width() : 1280);
  $('body').css('width', width);

  var playlistHeight = 
    $('#search_column').height() - $('#player_wrapper').height();
  $('#playlist_wrapper').css('height', playlistHeight);
  $('#addall', '#search_column').css(
    'margin-left', ($('#search_column').width()/2)-50);
  
  var playerColumnWidth = $('#player_column').width()-
    ($('#player_skin').width()+$('#player_wrapper').width()+50);
  $('#song_info').children().css('width', playerColumnWidth);
  $('.title').css('width', playerColumnWidth-55);
 
  $.app.canvas = $('#seeker').get(0);
  $.app.ctx = $.app.canvas.getContext('2d');
  google.search.Search.getBranding('google_branding');
  $('.gsc-branding-text', '#google_branding')
    .text('Artworks powered by ')
    .css({'font-size' : '11px', 'text-align' : 'right'});
}


$(document).ready(function () {
  $.app.player.init($('#player_column'));
  $.app.Storage.load();
  $.app.Playlist.loadPlaylist();
  $.app.mainColumn.init();
  $.app.Cache.init();
  skin_init();

  $('#addmusic').click(function () {
    $('input[name=actual_addmusic]').click();
  });

});

window.onbeforeunload =  function () {
  $.app.Playlist.storePlaylist();
  $.app.player.saveVolume();
}

