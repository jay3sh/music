
(function ($) {
var app = $.app;

function Storage() {}

Storage.titleIndex = {};
Storage.artistIndex = {};
Storage.nameIndex = {};
Storage.albumIndex = {};

Storage.updateIndex = function (muFile) {
  var hash = $.MD5(muFile.path);
  if(muFile.title && muFile.title.length > 0) {
    var key = muFile.title.toLowerCase();
    if(Storage.titleIndex[key]) {
      Storage.titleIndex[key].push(hash);
    } else {
      Storage.titleIndex[key] = [hash];
    }
  }

  if(muFile.artist && muFile.artist.length > 0) {
    var key = muFile.artist.toLowerCase();
    if(Storage.artistIndex[key]) {
      Storage.artistIndex[key].push(hash);
    } else {
      Storage.artistIndex[key] = [hash];
    }
  }

  if(muFile.album && muFile.album.length > 0) {
    var key = muFile.album.toLowerCase();
    if(Storage.albumIndex[key]) {
      Storage.albumIndex[key].push(hash);
    } else {
      Storage.albumIndex[key] = [hash];
    }
  }

  if(muFile.name && muFile.name.length > 0) {
    var key = muFile.name.toLowerCase().replace(/\.\w+$/,'');
    if(Storage.nameIndex[key]) {
      Storage.nameIndex[key].push(hash);
    } else {
      Storage.nameIndex[key] = [hash];
    }
  }
}

Storage.load = function () {
  var s = window.localStorage.getItem('__title_index__')
  Storage.titleIndex = s ? JSON.parse(s) : {};
  s = window.localStorage.getItem('__artist_index__')
  Storage.artistIndex = s ? JSON.parse(s) : {};
  s = window.localStorage.getItem('__name_index__')
  Storage.nameIndex = s ? JSON.parse(s) : {};
  s = window.localStorage.getItem('__album_index__')
  Storage.albumIndex = s ? JSON.parse(s) : {};
};

Storage.read = function (hash) {
  var s = window.localStorage.getItem(hash);
  return s ? JSON.parse(s) : null;
};

Storage.write = function (muFile) {
  var hash = $.MD5(muFile.path);
  window.localStorage.setItem(hash, JSON.stringify(muFile));
  Storage.updateIndex(muFile);
};

Storage.save = function () {
  window.localStorage.setItem('__title_index__',
    JSON.stringify(Storage.titleIndex));
  window.localStorage.setItem('__artist_index__',
    JSON.stringify(Storage.artistIndex));
  window.localStorage.setItem('__name_index__',
    JSON.stringify(Storage.nameIndex));
  window.localStorage.setItem('__album_index__',
    JSON.stringify(Storage.albumIndex));
};

Storage.search = function (keyword) {
  keyword = keyword.toLowerCase();
  var results = [];
  function searchIndex(index) {
    for (key in index) {
      if(key.indexOf(keyword) >= 0) {
        var hashes = index[key];
        results = results.concat(hashes);
      }
    }
  }
  searchIndex(Storage.titleIndex);
  searchIndex(Storage.artistIndex);
  searchIndex(Storage.nameIndex);
  searchIndex(Storage.albumIndex);
  return _(results).chain().uniq().map(Storage.read).value();
};

app.Storage = Storage;
})(jQuery);

