
google.load('search', '1');

function skin_init(){
  var width = (($(document).width())>1280? 1280: $(document).width());
  $.app.canvas = $('#seeker').get(0);
  $.app.ctx = $.app.canvas.getContext('2d');
  $('body').css('width', width);

  google.search.Search.getBranding('google_branding');
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

function getMetroLyricsURL(muFile){
  var name = muFile.title.split(' ').join('-');
  var artist = muFile.artist.split(' ').join('-');
  
  return ('http://www.metrolyrics.com/'+name+'-lyrics-'+artist+'.html');
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
}



$(document).ready(function () {
  skin_init();
  $.app.player.init($('#player_column'));
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
      divResults.append($.app.utils.getSongEntryHTML(muFile, true));
    });

    divResults.find('.entry_action')
      .click(function () {
        var muFile = $(this).data('muFile');
        var player_entry = $.app.utils.getSongEntryHTML(muFile, false);
        player_entry.find('.entry_action').click(function () {
          $.app.player.playMedia($(this).parent());
        });
        player_entry.find('.remove_action').click(function () {
          $.app.Playlist.remove($(this).parent());
        });
        $.app.Playlist.add(player_entry)
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


