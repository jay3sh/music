
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

function loadMusic(files) {
  var musicFiles = _(files).select(function (file) {
    var path = file.webkitRelativePath || file.mozFullPath;
    var fileName = file.fileName;
    var size = file.fileSize;
    var lpath = path.toLowerCase();
    return !/\.$/.test(lpath) &&
      (/\.mp3$/.test(lpath)) || 
      (/\.ogg$/.test(lpath)) ||
      (/\.m4a$/.test(lpath))
  });

  var total = musicFiles.length, progress = 0;

  function incProgress() {
    progress++;
    $('#addmusic').html(progress+' / '+total);
    if(progress == total) {
      $.app.Storage.save();
      $.app.printParseReport();
    } else {
      newMuFile(musicFiles[progress]);
    }
  }

  $.app.liveFiles = {};

  function newMuFile(f) {
    $.app.liveFiles[f.webkitRelativePath] = f;
    var muFile = new $.app.MuFile(f, incProgress);
  }

  newMuFile(musicFiles[progress]);
}


$(document).ready(function () {
  $.app.player.init($('#player_column'));
  $.app.Storage.load();
  $.app.Playlist.loadPlaylist();
  $.app.Cache.init();
  skin_init();

  $('#addmusic').click(function () {
    $('input[name=actual_addmusic]').click();
  });

  $('input[name=search]').keyup(function (e) {

    var divResults = $('#search_results');
    divResults.empty();
    var text = $(this).val();

    if(!text || (text && text.length < 4)) { return; }

    var results = $.app.Storage.search($(this).val());
    _(results).each(function (muFile) {
      divResults.append($.app.utils.getSongEntryHTML(muFile, true));
    });


    divResults.find('.entry_action')
      .click(function () {
        var muFile = $(this).data('muFile');
        var player_entry = $.app.utils.getSongEntryHTML(muFile, false);
        $.app.Playlist.attachEntryControls(player_entry);
        $.app.Playlist.add(player_entry)
      });

  })
  .focus(function (e){
    $(this).val('');
  })
  .focusout(function (e){
    if($(this).val() == ''){
      $(this).val('Search...');
    }
  }); 
});

window.onbeforeunload =  function () {
  $.app.Playlist.storePlaylist();
  $.app.player.saveVolume();
}

