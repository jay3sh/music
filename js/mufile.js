
(function ($) {
var app = $.app;

function Storage() {}

Storage.titleIndex = {};
Storage.artistIndex = {};
Storage.nameIndex = {};

Storage.updateIndex = function (muFile) {

  if(muFile.title && muFile.title.length > 0) {
    if(Storage.titleIndex[muFile.title]) {
      Storage.titleIndex[muFile.title].push(muFile.path);
    } else {
      Storage.titleIndex[muFile.title] = [muFile.path];
    }
  }

  if(muFile.artist && muFile.artist.length > 0) {
    if(Storage.artistIndex[muFile.artist]) {
      Storage.artistIndex[muFile.artist].push(muFile.path);
    } else {
      Storage.artistIndex[muFile.artist] = [muFile.path];
    }
  }

  if(muFile.name && muFile.name.length > 0) {
    if(Storage.nameIndex[muFile.name]) {
      Storage.nameIndex[muFile.name].push(muFile.path);
    } else {
      Storage.nameIndex[muFile.name] = [muFile.path];
    }
  }
}

Storage.load = function () {
  var s = window.localStorage.getItem('__title_index__')
  Storage.titleIndex = s ? JSON.parse(s) : {};
  s = window.localStorage.getItem('__artist_index__')
  Storage.artistIndex = s ? JSON.parse(s) : {};
  var s = window.localStorage.getItem('__name_index__')
  Storage.nameIndex = s ? JSON.parse(s) : {};
}

Storage.read = function (path) {
  var s = window.localStorage.getItem(path);
  return s ? JSON.parse(s) : null;
};

Storage.write = function (muFile) {
  window.localStorage.setItem(muFile.path, JSON.stringify(muFile));
  Storage.updateIndex(muFile);
};

Storage.save = function () {
  window.localStorage.setItem('__title_index__',
    JSON.stringify(Storage.titleIndex));
  window.localStorage.setItem('__artist_index__',
    JSON.stringify(Storage.artistIndex));
  window.localStorage.setItem('__name_index__',
    JSON.stringify(Storage.nameIndex));
};

Storage.search = function (keyword) {
};

app.Storage = Storage;
})(jQuery);



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
  return file.fileSize;
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

  if(pMuFile = app.Storage.read(this.subpaths)) {
    thisref.title = pMuFile.title;
    thisref.artist = pMuFile.artist;
    thisref.album = pMuFile.album;
    thisref.genre = pMuFile.genre;
    doneCallback();
  } else {
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
  }
}

MuFile.prototype = {
  getObjectURL : function () {
  }
};

app.MuFile = MuFile;
})(jQuery);

