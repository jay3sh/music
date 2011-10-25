(function ($){
  var app = $.app;
  var compat = app.utils.compat;

  function Importer() {  }
  
  function loadMusic(files) {
    var musicFiles = _(files).select(function (file) {
      var path = compat.getPath(file);
      var fileName = compat.getName(file);
      var size = compat.getSize(file);
      var lpath = path.toLowerCase();
      return !/\.$/.test(lpath) &&
        (/\.mp3$/.test(lpath)) || 
        (/\.ogg$/.test(lpath)) ||
        (/\.m4a$/.test(lpath))
    });

    $('input[name=search]', '#search_column').val('Search...');
    if($('#curtain').is(':visible')) { app.Skin.hideCurtain(); }
    if(!$('#player_container').is(':visible')) { app.Skin.showPlayerScreen(); }
    app.mainColumn.startProgress();
    app.mainColumn.showShelf();
    var artworkHints = [];
    var total = musicFiles.length, progress = 0;
    function onCreate(muFile) {
      
      /*
       * Artwork fetching from Google Image Search
       *
       * We seek unique album artworks for a group of songs to display in
       * the artwork grid. This algorithm, does this grouping of songs in
       * two steps.
       * 1. We find unique combinations of album+artist, then feed it 
       * to Google image search. Thus all songs that have same album+artist
       * text will be grouped under the resulting image
       * 2. It's possible that due to inaccuracies in file naming we may
       * end up with album+artist strings that are different in characters
       * but are essentially the same e.g. "My Album Bryan Adams" and 
       * "My Album Bryan_Adams". Fortunately Google Image search will 
       * return same image search result for both these strings. Therefore
       * we check the returned URL and if we already have it for some
       * other album+artist string, then we combine the two groups.
       */

      if(muFile.album && muFile.album.length > 0 && 
        muFile.artist && muFile.artist.length > 0)
      {
        var artworkHint = {
          album : muFile.album,
          artist : muFile.artist,
        };
        var found = _(artworkHints).any(
          function (ah) {
            return 
            (ah.artist.toLowerCase() == artworkHint.artist.toLowerCase()) && 
            (ah.album.toLowerCase() == artworkHint.album.toLowerCase());
          }
        );
        if(!found) {
          var detect =
            _.detect(app.localArtworks, function (artwork){
              return (artwork.album == artworkHint.album 
                && artwork.artist == artworkHint.artist);
            });
          if(!detect){
            app.utils.searchImage(
              artworkHint.album, artworkHint.artist,
              function (url, artist, album) {
                if(_.isUndefined(app.localArtworks[url])) {
                  app.mainColumn.populateShelf(url, artist, album);
                  app.localArtworks[url] = { 
                    album : album, 
                    artist : artist
                  };
                  app.mainColumn.storeArtworkMap();
                }
              }
            );
          }
          artworkHints.push(artworkHint); 
        }
      }

      progress++;
      if(progress == total) {
        app.Storage.save();
        app.printParseReport();
        app.mainColumn.completeProgress();
      } else {
        newMuFile(musicFiles[progress]);
        app.mainColumn.makeProgress(total, progress);
      }
    }

    $.app.liveFiles = {};

    function newMuFile(f) {
      $.app.liveFiles[compat.getPath(f)] = f;
      new $.app.MuFile(f, onCreate);
    }

    newMuFile(musicFiles[progress]);
  }
  
  app.Importer = Importer;
  app.Importer.loadMusic = loadMusic;
})(jQuery)
