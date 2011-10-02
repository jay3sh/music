

function loadMusic(files) {
  var musicFiles = _(files).select(function (file) {
    var path = file.webkitRelativePath || file.mozFullPath;
    var fileName = file.fileName;
    var size = file.fileSize;
    return !/\.$/.test(path) &&
      (/\.mp3$/.test(path)) || 
      (/\.ogg$/.test(path)) ||
      (/\.m4a$/.test(path))
  });

  var total = muFiles.length, progress = 0;
  function incProgress() {
    console.log(++progress);
  }
  var muFiles = _(musicFiles).map(function (f) {
    return new app.MuFile(f, incProgress);
  });

  setTimeout(function () {
    /*
    var song = _(songs).first();
    var url = window.webkitURL.createObjectURL(song);
    $("#player").get(0).src = url;
    $("#player").get(0).play();
    */
  }, 300)
}

function getSongEntryHtml(name, artist) {
  return '<div class="entry">'+
    '<span class="song_name">'+name+'</span>'+
    '&nbsp;&nbsp;'+
    '<span class="artist_name">'+artist+'</span>'+
    '<span class="add_song">+</span>'+
  '</div>';
}

function getPrettySongName(muFile) {
  var name = muFile.fileName.length > muFile.title ?
    muFile.fileName : muFile.title;
  return name.replace(/\.\w+$/,'');
}

$(document).ready(function () {
  app.db = new app.DB();

  $('#addmusic').click(function () {
    $('input[name=actual_addmusic]').click();
  });

  $('input[name=search]').keydown(function () {
    
    var results = $('#search_results');
    $.app.db.search($(this).val(), function (tx, r) {
      if(r.rows.length > 0) {
        results.empty();
        _(r.rows.length).times(function (i) {
          var muFile = r.rows.item(i);
          results.append(getSongEntryHtml(
            getPrettySongName(muFile), muFile.artist))
        });
      }
    })
  });
});
