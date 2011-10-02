
function loadMusic(files) {
  var songs = _(files).select(function (file) {
    var path = file.webkitRelativePath || file.mozFullPath;
    var fileName = file.fileName;
    var size = file.fileSize;
    return !/\.$/.test(path) &&
      (/\.mp3$/.test(path)) || 
      (/\.ogg$/.test(path)) ||
      (/\.m4a$/.test(path))
  });

  _(songs).each(function (f) {
    app.db.getByPath(f.webkitRelativePath, function (tx, r) {
      if(r.rows.length == 0) {
        ID3v2.parseFile(f, function (tags) {
          $.app.db.put([
            f.webkitRelativePath,
            f.fileName,
            f.fileSize,
            tags.Title || '',
            tags.Artist || '',
            tags.Album || '',
            tags.Genre || ''
          ])
        });
      } else {
        console.log('Skipping '+f.webkitRelativePath);
      }
    });
  });

  setTimeout(function () {
    var song = _(songs).first();
    var url = window.webkitURL.createObjectURL(song);
    $("#player").get(0).src = url;
    $("#player").get(0).play();
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
