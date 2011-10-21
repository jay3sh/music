
google.load('search', '1');

function skin_init(){
  var width = ($(document).width()>1280 ? $(document).width() : 1280);
  $('body').css('width', width);

  var playlistHeight = 
    $('#search_column').height() - $('#player_wrapper').height();
  $('#playlist_wrapper').css('height', playlistHeight);
  
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
  if(_.isNull(window.localStorage.getItem('__name_index__'))){
    console.log('Home Screen');
    $('#player_column').hide();
    $('#search_column').hide();
    $('#playlist_wrapper').hide();
    $('#footer').hide();
    skin_init();
    $('#addmusic').click(function () {
      $('input[name=actual_addmusic]').click();
    });
    return;
  } 
  else {  
    $.app.player.init($('#player_column'));
    $.app.Storage.load();
    $.app.Playlist.loadPlaylist();
    $.app.mainColumn.init();
    $.app.Cache.init();
  }

});

window.onbeforeunload =  function () {
  $.app.Playlist.storePlaylist();
  $.app.player.saveVolume();
}

