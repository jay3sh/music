(function ($){
  var app = $.app;
  
  function Skin() {}
  
  function init(){
    var width = ($(document).width()>1280 ? $(document).width() : 1280);
    $('body').css('width', width);

    var playlistHeight = 
      $('#search_column').height() - $('#player_wrapper').height() + 10;
    $('#playlist_wrapper').css('height', playlistHeight);
    
    var playerColumnWidth = $('#player_column').width()-
      ($('#player_skin').width()+$('#player_wrapper').width()+50);
    $('#song_info').children().css('width', playerColumnWidth);
    $('.title').css('width', playerColumnWidth-55);

    $('input[name=search]')
      .width($('#search_column').width()-$('#addall').width()-40);
   
    $.app.canvas = $('#seeker').get(0);
    $.app.ctx = $.app.canvas.getContext('2d');
    google.search.Search.getBranding('google_branding');
    $('.gsc-branding-text', '#google_branding')
      .text('Artworks powered by ')
      .css({'font-size' : '11px', 'text-align' : 'right'});

    $('#addmusic').click(function () {
      $('input[name=actual_addmusic]').click();
    });
  }

  function showHomeScreen(){
    $('#player_container').hide();
    $('#home_screen').fadeIn();
  }

  function showPlayerScreen(){ 
    $('#home_screen').hide();
    $('#player_container').fadeIn();
    $.app.player.init($('#player_column'));
    $.app.Storage.load();
    $.app.Playlist.loadPlaylist();
    $.app.mainColumn.init();
    $.app.Cache.init();
  }

  app.Skin = Skin;
  app.Skin.init = init;
  app.Skin.showHomeScreen = showHomeScreen;
  app.Skin.showPlayerScreen = showPlayerScreen;

})(jQuery);
