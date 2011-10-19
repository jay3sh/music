
(function ($){
  var app = $.app;

  function mainColumn () {}

  function showSearchResults() {
    $('#shelf', '#search_column').hide();
    $('#search_results', '#search_column').show();
  }

  function showShelf() {
    $('#shelf', '#search_column').show();
    $('#search_results', '#search_column').hide();
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

    showShelf();
    var artworkHints = [];
    var total = musicFiles.length, progress = 0;
    var shelf = $('#shelf', '#search_column');
    var artworkNum = Math.floor(shelf.width()/125);
    var margin = (shelf.width()-(artworkNum*125))/(artworkNum*2);

    function onCreate(muFile) {
      
      // Add unique artwork hint
      if(muFile.album && muFile.album.length > 0 && 
        muFile.artist && muFile.artist.length > 0)
      {
        artworkHint = {
          album : muFile.album,
          artist : muFile.artist
        };
        var found = _(artworkHints).any(
          function (ah) { 
            return (ah.artist == artworkHint.artist) && 
              (ah.album == artworkHint.album);
          });
        if(!found) {
          app.utils.searchImage(
            artworkHint.album + ' ' + artworkHint.artist, 
            function (url){
              var artwork = $('<img></img>')
                .attr('src', url)
                .css('margin', margin)
                .fadeIn();
              $('#shelf', '#search_column').append(artwork);
            }
          );
          artworkHints.push(artworkHint); 
        }
      }

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
      new $.app.MuFile(f, onCreate);
    }

    newMuFile(musicFiles[progress]);
  }
  
  function init() {
    /*if(_.isNull(window.localStorage.getItem('__name_index__'))){} 
    else { } */ 
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
      showSearchResults();
    })
    .focusout(function (e){
      if($(this).val() == ''){
        $(this).val('Search...');
        showShelf();
      }
    }); 
  }

  app.mainColumn = mainColumn;
  app.mainColumn.loadMusic = loadMusic;
  app.mainColumn.init = init;

})(jQuery);
