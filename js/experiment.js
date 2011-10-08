
window.requestFileSystem =
  window.requestFileSystem || window.webkitRequestFileSystem;

$(document).ready(function () {


  $('#addmusic').click(function () {
    $('input[name=actual_addmusic]').click();
  });

});

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

function loadMusic(files) {
  var file = _(files).chain().select(function (f) {
    return /\.mp3$/.test(f.webkitRelativePath.toLowerCase());
  }).first().value();

  var reader = new FileReader();
  reader.onload = function (e) {
    var view = new jDataView(this.result);
    console.log(view.getString(3,0));
    console.log('version',view.getInt8(3));
    console.log('revision',view.getInt8(4));
    console.log('flags',view.getInt8(5));
    console.log('size',view.getUint32(6, littleEndian=false));
    console.log('First frame header',view.getString(4,10));
    var frameSize = view.getUint32(14, littleEndian=false);
    console.log('First frame size', frameSize);
    console.log('First frame flags',view.getUint16(18, littleEndian=false));
    console.log('First frame content', view.getString(frameSize,20));
  };
  reader.readAsArrayBuffer(file);
}

function loadMusicForCaching(files) {

  var file = _(files).chain().select(function (f) {
    return /\.mp3$/.test(f.webkitRelativePath.toLowerCase());
  }).first().value();

  window.requestFileSystem(window.PERSISTENT, 100*1024*1024,
    function onSuccess(fs) {
      filesystem = fs;
      (function(f) {
        fs.root.getFile(f.fileName,
          {create: true, exclusive: true},
          function(fileEntry) {
          fileEntry.createWriter(function(fileWriter) {
            fileWriter.write(f);
          }, function (e) { console.log('write error: '+parseError(e)); });
        }, function (e) { console.log('getfile error: '+parseError(e)); });
      })(file);
    },
    function (e) { console.log('reqFS error: '+parseError(e)); });
}

function listMusic() {
  window.requestFileSystem(window.PERSISTENT, 100*1024*1024,
    function onSuccess(fs) {
      var dirReader = fs.root.createReader();
      dirReader.readEntries(function (results) {
        console.log(results);
      });
    },
    function (e) { console.log('reqFS error: '+parseError(e)); });
}

function playCache() {
  window.requestFileSystem(window.PERSISTENT, 100*1024*1024,
    function onSuccess(fs) {
      var dirReader = fs.root.createReader();
      dirReader.readEntries(function (results) {
        var fentry = results[0];
        console.log(fentry.toURL());
        $('#player').get(0).src = fentry.toURL();
        $('#player').get(0).play();
      });
    },
    function (e) { console.log('reqFS error: '+parseError(e)); });
}
