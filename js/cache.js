
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
  Cache.list('songs', function (entries) {
    var matching = _(entries).select(function (fe) {
      var match = /(\w+)\.(\w+)/.exec(fe.name)
      return match[1] == hash;
    });
    if(matching.length > 0) {
      if(callback) { callback(matching[0].toURL()); }
    } else {
      callback(null);
    }
  }, function (e) {
    console.log('Cache.list '+parseError(e));
    callback(null);
  });
};

Cache.add = function (hash, f) {
  window.requestFileSystem(window.TEMPORARY, CACHE_SIZE,
    function onSuccess(fs) {

      (function addEntry() {
        fs.root.getDirectory('songs', {},
          function (dirEntry) {
            console.log('Adding to cache', hash);
            dirEntry.getFile(hash+'.'+new Date().getTime(), { create:true },
            function success(fileEntry) {
              fileEntry.createWriter(
                function(fileWriter) { fileWriter.write(f); },
                function (e) { console.error('write: '+parseError(e)); }
              );
            },
            function failure(e) {
              if(e.code == FileError.QUOTA_EXCEEDED_ERR) {
                Cache.deleteLRU(addEntry);
              } else {
                console.error('getFile: '+parseError(e));
              }
            });
          },
          function (e) { console.error('getDir: '+parseError(e)); }
        );
      })()

    },
    function (e) { console.log('reqfs: '+parseError(e)); }
  );
};

Cache.deleteLRU = function (callback, errcallback) {
  Cache.list('songs',function (entries) {
    if(entries.length == 0) {
      throw new Exception('Unexpected call to deleteLRU');
    }
    var timedEntries = _(entries).map(function (fe) {
      var match = /(\w+)\.(\w+)/.exec(fe.name);
      return { timestamp : parseInt(match[2], 10), entry : fe };
    });
    timedEntries.sort(function (x, y) {
      return x.timestamp > y.timestamp;
    });
    console.log('Removing LRU '+timedEntries[0].entry.name);
    timedEntries[0].entry.remove(
      function () { callback(); },
      function (e) { if(errcallback) { errcallback(e); } }
    );
  }, function (e) {
    errcallback(e);
  });
}

Cache.list = function (dirname, callback, errcallback) {
  window.requestFileSystem(window.TEMPORARY, CACHE_SIZE,
    function onSuccess(fs) {
      fs.root.getDirectory(dirname, {},
        function (dirEntry) {
          var dirReader = dirEntry.createReader();
          var entries = [];
          function toArray(list) {
            return Array.prototype.slice.call(list || [], 0);
          }
          (function readEntries() {
            dirReader.readEntries(function (results) {
              if(!results.length) {
                if(callback) { callback(entries); }
              } else {
                entries = entries.concat(toArray(results));
                readEntries();
              }
            },
            function (e) { if(errcallback) { errcallback(e); } });
          })();
        },
        function (e) { if(errcallback) { errcallback(e); } }
      );
    },
    function (e) { if(errcallback) { errcallback(e); } }
  );
};

Cache.empty = function () {
  Cache.list('songs', function (entries) {
    _(entries).each(function (fentry) {
      fentry.remove(function () {}, function (e) {
        console.error('file delete', parseError(e));
      });
    });
  },
  function (e) {
    console.error('Cache.list '+parseError(e));
  })
};

Cache.init = function () {
  window.requestFileSystem(window.TEMPORARY, CACHE_SIZE,
    function onSuccess(fs) {
      fs.root.getDirectory('songs', { create:true }, function (dirEntry) {});
    },
    function (e) { console.log('reqfs: '+parseError(e)); }
  );
};

app.Cache = Cache;
})(jQuery);

