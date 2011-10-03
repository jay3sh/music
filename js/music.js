

function loadMusic(files) {
  var musicFiles = _(files).select(function (file) {
    var path = file.webkitRelativePath || file.mozFullPath;
    var fileName = file.fileName;
    var size = file.fileSize;
    return !/\.$/.test(path) &&
      (/\.mp3$/.test(path)) || 
      (/\.ogg$/.test(path)) ||
      (/\.m4a$/.test(path))
  });

  var total = musicFiles.length, progress = 0;
  var t1 = new Date().getTime();
  function incProgress() {
    progress++;
    $('#addmusic').html(progress+' / '+total);
    if(progress == total) {
      $.app.Storage.save();
      console.log('Done saving '+total+'  '+(new Date().getTime()-t1)+' msec');
    }
  }
  $.app.liveFiles = {};
  _(musicFiles).each(function (f) {
    var muFile = new $.app.MuFile(f, incProgress);
    $.app.liveFiles[muFile.path] = f;
  });

  setTimeout(function () {
    /*
    var song = _(songs).first();
    var url = window.webkitURL.createObjectURL(song);
    $("#player").get(0).src = url;
    $("#player").get(0).play();
    */
  }, 300)
}

function getPrettySongName(muFile) {
  var name = muFile.name.length > muFile.title.length ?
    muFile.name : muFile.title;
  return name.replace(/\.\w+$/,'');
}

function getSongEntryHtml(muFile, asSearchResult) {
  var name = getPrettySongName(muFile);
  var entryHTML = '<div class="entry">'+
    '<span class="song_name">'+getPrettySongName(muFile)+'</span>'+
    '&nbsp;&nbsp;'+
    '<span class="artist_name">'+muFile.artist+'</span>'+
    '<span class="entry_action">'+
    (asSearchResult ? '+' : '>')+
    '</span>'+
  '</div>';
  var entry = $(entryHTML);
  entry.find('.entry_action').data('muFile',muFile);
  return entry;
}

function getObjectURL(path) {
  var liveFile = $.app.liveFiles[path];
  return liveFile ? window.webkitURL.createObjectURL(liveFile) : null;
}

$(document).ready(function () {

  $.app.Storage.load();

  $('#addmusic').click(function () {
    $('input[name=actual_addmusic]').click();
  });

  $('input[name=search]').keyup(function (e) {

    var divResults = $('#search_results');
    divResults.empty();
    var text = $(this).val();

    if(!text || (text && text.length < 4)) { return; }

    var results = $.app.Storage.search($(this).val());
    _(results).each(function (muFile) {
      divResults.append(getSongEntryHtml(muFile, true));
    });

    divResults.find('.entry_action').click(function () {
      var muFile = $(this).data('muFile');
      var player_entry = getSongEntryHtml(muFile, false);
      player_entry.find('.entry_action').click(function () {
        var muFile = $(this).data('muFile');
        var url = getObjectURL(muFile.path);
        if(url) {
          $('#player').get(0).src = url;
          $('#player').get(0).play();
        } else {
          alert('Add music again');
        }
      });
      $('#player_column #playlist').append(player_entry);
    });

  });
});
