
(function ($) {
var app = $.app;
var compat = app.utils.compat;

function getSubPaths(path) {
  var subpaths = [];
  while(path.indexOf('/') > 0) {
    subpaths.push(path);
    path = path.substr(path.indexOf('/')+1);
  }
  subpaths.push(path);
  return subpaths;
}

function MuFile(file, doneCallback) {
  var thisref = this;

  this.fileObject = file;

  function findInStorage(subpaths) {
    for(var i=0, l=subpaths.length; i<l; i++) {
      var subpath = subpaths[i];
      var pMuFile = app.Storage.read($.MD5(subpath));
      if(pMuFile) { return pMuFile; }
    }
  }

  this.path = compat.getPath(file);
  this.subpaths = getSubPaths(this.path);
  this.name = compat.getName(file);
  this.size = compat.getSize(file);

  if(pMuFile = findInStorage(this.subpaths)) {
    thisref.title = pMuFile.title;
    thisref.artist = pMuFile.artist;
    thisref.album = pMuFile.album;
    thisref.genre = pMuFile.genre;
    doneCallback(this);
  } else {
    app.parseTags(file, function (tags) {
      thisref.title = tags.title ? tags.title.trim() : '';
      thisref.artist = tags.artist ? tags.artist.trim() : '';
      thisref.album = tags.album ? tags.album.trim() : '';
      thisref.genre = tags.genre ? tags.genre.trim() : '';

      app.Storage.write({
        path : thisref.path,
        name : thisref.name,
        size : thisref.size,
        title : thisref.title,
        artist : thisref.artist,
        album : thisref.album,
        genre : thisref.genre
      });
      doneCallback(thisref);
    });
  }
}

MuFile.prototype = {
};

app.MuFile = MuFile;
})(jQuery);

