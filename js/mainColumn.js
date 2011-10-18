
(function ($){
  var app = $.app;

  function mainColumn () {}
  
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

    var artworkHints = [];
    var total = musicFiles.length, progress = 0;

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
              //console.log(url); 
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
    if(_.isNull(window.localStorage.getItem('__name_index__'))){} 
    else { } 
  }

  app.mainColumn = mainColumn;
  app.mainColumn.loadMusic = loadMusic;
  app.mainColumn.init = init;

})(jQuery);
