
function loadMusic(files) {
  var songs = _(files).select(function (file) {
    var path = file.webkitRelativePath || file.mozFullPath;
    var fileName = file.fileName;
    var size = file.fileSize;
    return !/\.$/.test(path) &&
      (/\.mp3$/.test(path)) || (/\.ogg$/.test(path))
  });

  _(songs).each(function (f) {
    $('body').append(f.fileName+'</br>');
  });

}
