
(function ($) {
var app = $.app;

window.requestFileSystem =
  window.requestFileSystem || window.webkitRequestFileSystem;

var CACHE_SIZE = 100*1024*1024;

function Cache() {}

function parseError(e) {
  var msg = '';
  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };
  return msg;
}

Cache.getPlayableURL = function (hash, callback) {
  window.requestFileSystem(window.PERSISTENT, CACHE_SIZE,
    function onSuccess(fs) {
      fs.root.getDirectory('songs', { create:true }, function (dirEntry) {
          dirEntry.getFile(hash, { create:false },
          function success(file) { callback(file.toURL()); },
          function failure(e) { callback(null); });
      }, function (e) {
        console.error('getDir: '+parseError(e));
        callback(null);
      });
    }, function (e) {
      console.error('reqfs: '+parseError(e)); 
      callback(null);
    });
};

Cache.add = function (hash, f) {
  window.requestFileSystem(window.PERSISTENT, CACHE_SIZE,
    function onSuccess(fs) {
      fs.root.getDirectory('songs', {},
        function (dirEntry) {
          dirEntry.getFile(hash, { create:true },
          function success(fileEntry) {
            fileEntry.createWriter(
              function(fileWriter) { fileWriter.write(f); },
              function (e) { console.error('write: '+parseError(e)); }
            );
          },
          function failure(e) { console.error('getFile: '+parseError(e)); });
        },
        function (e) { console.error('getDir: '+parseError(e)); }
      );
    },
    function (e) { console.log('reqfs: '+parseError(e)); }
  );
};

Cache.init = function () {
  window.requestFileSystem(window.PERSISTENT, CACHE_SIZE,
    function onSuccess(fs) {
      fs.root.getDirectory('songs', { create:true }, function (dirEntry) {});
    },
    function (e) { console.log('reqfs: '+parseError(e)); }
  );
}

app.Cache = Cache;
})(jQuery);

