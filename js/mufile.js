
(function ($) {
var app = $.app;

function getPath(file) {
  return file.webkitRelativePath;
}

function getName(file) {
  return file.fileName || file.name;
}

function getSubPaths(path) {
  var subpaths = [];
  while(path.indexOf('/') > 0) {
    subpaths.push(path);
    path = path.substr(path.indexOf('/')+1);
  }
  subpaths.push(path);
  return subpaths;
}

function getSize(file) {
  return file.fileSize;
}

function MuFile(file, doneCallback) {
  var thisref = this;

  this.fileObject = file;

  function findInStorage(subpaths) {
    for(var i=0, l=subpaths.length; i<l; i++) {
      var subpath = subpaths[i];
      var pMuFile = app.Storage.read(subpath);
      if(pMuFile) { return pMuFile; }
    }
  }

  this.path = getPath(file);
  this.subpaths = getSubPaths(this.path);
  this.name = getName(file);
  this.size = getSize(file);

  if(pMuFile = findInStorage(this.subpaths)) {
    thisref.title = pMuFile.title;
    thisref.artist = pMuFile.artist;
    thisref.album = pMuFile.album;
    thisref.genre = pMuFile.genre;
    doneCallback();
  } else {
    if(/\.mp3$/.test(this.path.toLowerCase())) {
      ID3v2.parseFile(file, function (tags) {
        thisref.title = tags.Title ? tags.Title : '';
        thisref.artist = tags.Artist ? tags.Artist : '';
        thisref.album = tags.Album ? tags.Album : '';
        thisref.genre = tags.Genre ? tags.Genre : '';

        app.Storage.write({
          path : thisref.path,
          name : thisref.name,
          size : thisref.size,
          title : thisref.title,
          artist : thisref.artist,
          album : thisref.album,
          genre : thisref.genre
        });
        doneCallback();
      });
    } else {
      thisref.title = thisref.name;
      thisref.artist = '';
      thisref.album = '';
      thisref.genre = '';

      app.Storage.write({
        path : thisref.path,
        name : thisref.name,
        size : thisref.size,
        title : thisref.title,
        artist : thisref.artist,
        album : thisref.album,
        genre : thisref.genre
      });
      doneCallback();
    }
  }
}

MuFile.prototype = {
};

app.MuFile = MuFile;
})(jQuery);

