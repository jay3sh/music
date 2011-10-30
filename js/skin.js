(function ($){
  var app = $.app;
  
  function Skin() {}
  
  function init(){
    var width = ($(document).width()>1280 ? $(document).width() : 1280);
    $('body').css('width', width);

    var playlistHeight = 
      $('#search_column').height() - $('#player_wrapper').height();
    $('#playlist_wrapper').css('height', playlistHeight);
    $('#playlist').height(playlistHeight-55);

    var shelfHeight = $('#search_column').height() - 85;
    $('#shelf').height(shelfHeight);
    $('#settings').height(shelfHeight);
    $('#ytshelf').height(shelfHeight);
    $('#search_results').height(shelfHeight);
    
    var playerColumnWidth = $('#player_column').width()-
      ($('#player_skin').width()+$('#player_wrapper').width()+50);
    $('#song_info').children().css('width', playerColumnWidth);
    $('.title').css('width', playerColumnWidth-55);

    $('input[name=search]')
      .width($('#search_column').width()-$('#addall').width()-50);
   
    $.app.canvas = $('#seeker').get(0);
    $.app.ctx = $.app.canvas.getContext('2d');

    $('#progressbar').width($('#shelf', '#search_column').width());
    $('#progressbar').height($('#shelf', '#search_column').height());
    $.app.progress_canvas = $('#complete_progress').get(0);
    $.app.progress_ctx = $.app.progress_canvas.getContext('2d');

    google.search.Search.getBranding('google_branding');
    $('.gsc-branding-text', '#google_branding')
      .text('Artworks powered by ')
      .css({'font-size' : '11px', 'text-align' : 'right'});

    $('#addmusic').click(function () {
      $('input[name=actual_addmusic]').click();
    });

    $('#reloadmusic').click(function () {
      $('input[name=actual_addmusic]').click();
    });
  }

  function showCurtain(){
    $('#curtain').fadeIn(); 
  }

  function hideCurtain(){
    $('#curtain').fadeOut(); 
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
    $.app.Playlist.init();
    $.app.mainColumn.init();
    $.app.Cache.init();
  }

  function showNotification(msg, autocancel) {
    var msgElement = $('<span></span>').html(msg);
    if(autocancel) {
      setTimeout(function () {
        $('#notification').fadeOut('slow');
      }, 5000);
    } else {
      msgElement.append(
        '&nbsp;<a href="#" id="cancel"><img src="images/Delete.png"></a>&nbsp;');
      msgElement.find('#cancel').click(function () {
        $('#notification').fadeOut();
      });
    }
    $('#notification').html(msgElement).fadeIn();
  }

  app.Skin = Skin;
  app.Skin.init = init;
  app.Skin.showHomeScreen = showHomeScreen;
  app.Skin.showPlayerScreen = showPlayerScreen;
  app.Skin.showCurtain = showCurtain;
  app.Skin.hideCurtain = hideCurtain;
  app.Skin.showNotification = showNotification;

})(jQuery);
