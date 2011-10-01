
function loadMusic(files) {
  var songs = _(files).select(function (file) {
    var path = file.webkitRelativePath || file.mozFullPath;
    var fileName = file.fileName;
    var size = file.fileSize;
    return !/\.$/.test(path) &&
      (/\.mp3$/.test(path)) || (/\.ogg$/.test(path))
  });

  _(songs).each(function (f) {
    app.db.getByPath(f.webkitRelativePath, function (tx, r) {
      if(r.rows.length == 0) {
        ID3v2.parseFile(f, function (tags) {
          $.app.db.put([
            f.webkitRelativePath,
            f.fileName,
            f.fileSize,
            tags.Title,
            tags.Artist,
            tags.Album,
            tags.Genre
          ])
        });
      } else {
        console.log('Skipping '+f.webkitRelativePath);
      }
    });
  });

  /*
  setTimeout(function () {
    _(songs).each(function (f) {
      console.log(window.webkitURL.createObjectURL(f));
    });
  }, 3000)
  */

}

$(document).ready(function () {
  app.db = new app.DB();

  $('#addmusic').click(function () {
    $('input[name=actual_addmusic]').click();
  });
});
