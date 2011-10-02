

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
  var muFiles = _(musicFiles).map(function (f) {
    return new $.app.MuFile(f, incProgress);
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

function getSongEntryHtml(name, artist) {
  return '<div class="entry">'+
    '<span class="song_name">'+name+'</span>'+
    '&nbsp;&nbsp;'+
    '<span class="artist_name">'+artist+'</span>'+
    '<span class="add_song">+</span>'+
  '</div>';
}

function getPrettySongName(muFile) {
  var name = muFile.name.length > muFile.title.length ?
    muFile.name : muFile.title;
  return name.replace(/\.\w+$/,'');
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
      divResults.append(getSongEntryHtml(
        getPrettySongName(muFile), muFile.artist))
    });
  });
});
