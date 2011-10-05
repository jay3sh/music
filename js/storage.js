
(function ($) {
var app = $.app;

function Storage() {}

Storage.titleIndex = {};
Storage.artistIndex = {};
Storage.nameIndex = {};

Storage.updateIndex = function (muFile) {
  if(muFile.title && muFile.title.length > 0) {
    var key = muFile.artist.toLowerCase();
    if(Storage.titleIndex[key]) {
      Storage.titleIndex[key].push(muFile.path);
    } else {
      Storage.titleIndex[key] = [muFile.path];
    }
  }

  if(muFile.artist && muFile.artist.length > 0) {
    var key = muFile.artist.toLowerCase();
    if(Storage.artistIndex[key]) {
      Storage.artistIndex[key].push(muFile.path);
    } else {
      Storage.artistIndex[key] = [muFile.path];
    }
  }

  if(muFile.name && muFile.name.length > 0) {
    var key = muFile.name.toLowerCase().replace(/\.\w+$/,'');
    if(Storage.nameIndex[key]) {
      Storage.nameIndex[key].push(muFile.path);
    } else {
      Storage.nameIndex[key] = [muFile.path];
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
  keyword = keyword.toLowerCase();
  var results = [];
  function searchIndex(index) {
    for (key in index) {
      if(key.indexOf(keyword) >= 0) {
        var paths = index[key];
        _(paths).each(function (path) {
          results.push(Storage.read(path));
        });
      }
    }
  }
  searchIndex(Storage.titleIndex);
  searchIndex(Storage.artistIndex);
  searchIndex(Storage.nameIndex);
  return results;
};

app.Storage = Storage;
})(jQuery);

