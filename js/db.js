
var app = $.app = {};

(function($) {

var curVersion = '1';
var db;

function createNew(tx) {
  tx.executeSql('CREATE TABLE IF NOT EXISTS '+
    'MusicFile ('+
    'id INTEGER PRIMARY KEY ASC, '+

    'path TEXT, '+
    'fileName TEXT, '+
    'size INTEGER, '+

    'title TEXT, '+
    'artist TEXT, '+
    'album TEXT, '+
    'genre TEXT)',

    [], onSuccess, onError);
}

function onSuccess(tx, r) { }
function onError(tx, e) { console.error('DB Error : '+e.message); }

function onUpdateSuccess() {}
function onUpdateError(e) { console.error('Update Error: '+e); }

function DB() {
  db = openDatabase('mu-sic','','mu-sic',5*1024*1024);

  if(db.version != curVersion) {
    db.changeVersion(db.version, db.curVersion, createNew,
      onUpdateError, onUpdateSuccess);
  }
}

DB.prototype = {
  put : function (musicFile, successCb) {
    db.transaction(function (tx) {
      tx.executeSql('INSERT INTO MusicFile'+
      '(path, fileName, size, title, artist, album, genre) '+
      'VALUES (?, ?, ?, ?, ?, ?, ?)', musicFile,
      onSuccess, onError);
    });
  },

  getByPath : function (path, onSuccess) {
    db.transaction(function(tx) {
      tx.executeSql('SELECT * FROM MusicFile WHERE path = "'+path+'"', [],
        onSuccess, onError);
    });
  }
}

$.app.DB = DB;

})(jQuery)
