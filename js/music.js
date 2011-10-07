
google.load('search', '1');

function player_init(){
  var width = (($(document).width())>1280? 1280: 1280);
  $('body').css('width', width);

  $('#player_wrapper #album_artwork').attr('src', '/images/nothumb.png');
}

function loadMusic(files) {
  var musicFiles = _(files).select(function (file) {
    var path = file.webkitRelativePath || file.mozFullPath;
    var fileName = file.fileName;
    var size = file.fileSize;
    var lpath = path.toLowerCase();
    return !/\.$/.test(lpath) &&
      (/\.mp3$/.test(lpath)) || 
      (/\.ogg$/.test(lpath)) ||
      (/\.m4a$/.test(lpath))
  });

  var total = musicFiles.length, progress = 0;

  function incProgress() {
    progress++;
    $('#addmusic').html(progress+' / '+total);
    if(progress == total) {
      $.app.Storage.save();
    } else {
      newMuFile(musicFiles[progress]);
    }
  }

  $.app.liveFiles = {};

  function newMuFile(f) {
    $.app.liveFiles[f.webkitRelativePath] = f;
    var muFile = new $.app.MuFile(f, incProgress);
  }

  newMuFile(musicFiles[progress]);
}

function getPrettySongName(muFile) {
  var name = muFile.name.length > muFile.title.length ?
    muFile.name : muFile.title;
  return name.replace(/\.\w+$/,'');
}

function getYoutubeSearchURL(muFile) {
  var name = getPrettySongName(muFile);
  return 'http://www.youtube.com/results?search_query='+
    name.split(/\s+/).join('+')+'+'+
    muFile.artist.split(/\s+/).join('+');
}

function getLyricsSearchURL(muFile) {
  var name = getPrettySongName(muFile);
  return 'http://www.google.com/search?q='+
    name.split(/\s+/).join('+')+'+'+
    muFile.artist.split(/\s+/).join('+')+'+lyrics';
}

function getArtistWikipediaURL(muFile) {
  return 'http://en.wikipedia.org/w/index.php?search='+
          muFile.artist.split(/\s+/).join('+');
}

function getAmazonLink(muFile) {
  return 'http://www.amazon.com/s?ie=UTF8&x=0&ref_=nb_sb_noss&y=0&field-keywords='+encodeURI(muFile.artist)+'&url=search-alias%3Ddigital-music&_encoding=UTF8&tag=myfreq-20&linkCode=ur2&camp=1789&creative=390957'
}

function getSongEntryHtml(muFile, asSearchResult) {
  var name = getPrettySongName(muFile);
  var entryHTML = '<div class="entry">'+
    '<span class="song_name">'+getPrettySongName(muFile)+'</span>'+
    '&nbsp;&nbsp;'+
    '<span class="album_name">'+muFile.album+'</span>'+
    '&nbsp;&nbsp;'+
    '<span class="artist_name">'+muFile.artist+'</span>'+
    '&nbsp;&nbsp;'+
    (asSearchResult ? '':
      '<span class="remove_action">-</span>')+
    (asSearchResult ? 
      '<span class="entry_action">+</span>' :
      '<span class="entry_action">&gt;</span>')+
    '&nbsp;&nbsp;'+
    '<a target="_blank" href="'+getYoutubeSearchURL(muFile)+'"><img src="/images/youtube.ico"/></a>'+
    '&nbsp;&nbsp;'+
    '<a target="_blank" href="'+getLyricsSearchURL(muFile)+'">L</a>'+
    '&nbsp;&nbsp;'+
    '<a target="_blank" href="'+getArtistWikipediaURL(muFile)+'"><img src="/images/wikipedia.ico"/></a>'+
    '&nbsp;&nbsp;'+
    '<a target="_blank" href="'+getAmazonLink(muFile)+'"><img src="/images/amazon.png"/></a>'+
  '</div>';
  var entry = $(entryHTML);
  entry.find('.entry_action').data('muFile',muFile);
  return entry;
}

function getObjectURL(path) {
  if($.app.liveFiles) {
    var liveFile = $.app.liveFiles[path];
    return liveFile ? window.webkitURL.createObjectURL(liveFile) : null;
  } else {
    return null;
  }
}

function searchImage(query, callback) {
  function onComplete() {
    if (imageSearch.results && imageSearch.results.length > 0) {
      var results = imageSearch.results;
      callback(results[0].tbUrl);
    }
  }

  var imageSearch = new google.search.ImageSearch();
  imageSearch.setSearchCompleteCallback(this, onComplete, null);
  imageSearch.execute(query);
  google.search.Search.getBranding('google_branding');
}

function updateSongInfo(muFile){
  var songInfo = $('#player_column #player_controls #song_info');
  $('#title', songInfo).text(muFile.title);
  $('#artist', songInfo).text(muFile.artist);
  $('#album', songInfo).text(muFile.album);
}

var currentPlaying = null;
$.app.nextSong = function () {
  currentPlaying.parent().children().css('backgroundColor','#fff');
  var nextDiv = currentPlaying.next();
  if(nextDiv.length == 0) {
    nextDiv = currentPlaying.parent().children().first();
  }
  play(nextDiv);
}

function play(div) {
  var muFile = div.find('.entry_action').data('muFile');
  div.css('backgroundColor','#fee');
  var url = getObjectURL(muFile.path);
  if(url) {
    $('#player').get(0).src = url;
    $('#player').get(0).play();
    currentPlaying = div;
    searchImage(muFile.album+' '+muFile.artist,function (tbUrl) {
      $('#player_wrapper #album_artwork').attr('src',tbUrl);
    });
    updateSongInfo(muFile);
  } else {
    alert('Add music again');
  }
}

$(document).ready(function () {
  player_init();

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
        $(this).parent().parent().children().css('backgroundColor','#fff');
        play($(this).parent());
      });
      player_entry.find('.remove_action').click(function () {
        play($(this).parent().remove());
      });
      $('#playlist_wrapper #playlist').append(player_entry);
    });

  })
  .focus(function (e){
    $(this).val('');
  })
  .focusout(function (e){
    if($(this).val() == ''){
      $(this).val('Search...');
    }
  });
  
});


