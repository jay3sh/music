
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
}

function getSize(file) {
  return f.fileSize;
}

function findInDatabase(subpaths, onFound, onNotFound) {
  var count = 0;

  function find() {
    app.db.getByPath(subpaths[count], function (tx, r) {
      if(r.rows.length > 0) {
        onFound(r.rows.item(0));
      } else {
        count++;
        if(count < subpaths.length) {
          find();
        } else {
          onNotFound();
        }
      }
    });
  }

  find();
}

function MuFile(file, doneCallback) {
  var thisref = this;

  this.fileObject = file;

  this.path = getPath(file);
  this.subpaths = getSubPaths(this.path);
  this.name = getName(file);
  this.size = getSize(file);

  findInDatabase(this.subpaths,
    function onFound(muFile) {
      this.title = muFile.title;
      this.artist = muFile.artist;
      this.album = muFile.album;
      this.genre = muFile.genre;
      doneCallback();
    },
    function onNotFound() {
      ID3v2.parseFile(file, function (tags) {
        thisref.title = tags.Title ? tags.Title : '';
        thisref.artist = tags.Artist ? tags.Artist : '';
        thisref.album = tags.Album ? tags.Album : '';
        thisref.genre = tags.Genre ? tags.Genre : '';

        // Write to database
        app.db.put([
          thisref.path,
          thisref.name,
          thisref.size,
          thisref.title,
          thisref.artist,
          thisref.album,
          thisref.genre
        ], doneCallback)
      });
    }
  );
}

MuFile.prototype = {
  getObjectURL : function () {
  }
};

app.MuFile = MuFile;
})(jQuery);

