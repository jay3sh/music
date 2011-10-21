(function ($){
  var app = $.app;

  function Importer() {  }
  
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

    $('input[name=search]', '#search_column').val('Search...');
    app.mainColumn.showShelf();
    var artworkHints = [];
    var total = musicFiles.length, progress = 0;
    function onCreate(muFile) {
      
      // Add unique artwork hint
      if(muFile.album && muFile.album.length > 0 && 
        muFile.artist && muFile.artist.length > 0)
      {
        var artworkHint = {
          album : muFile.album,
          artist : muFile.artist
        };
        var found = _(artworkHints).any(
          function (ah) { 
            return (ah.artist == artworkHint.artist) && 
              (ah.album == artworkHint.album);
          });
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
                if(_.isEmpty(app.localArtworks[url])){ 
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
  
  app.Importer = Importer;
  app.Importer.loadMusic = loadMusic;
})(jQuery)
