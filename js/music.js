
google.load('search', '1');

function player_init(){
  var width = (($(document).width())>1280? 1280: $(document).width());
  $.app.canvas = $('#seeker').get(0);
  $.app.ctx = $.app.canvas.getContext('2d');
  $('body').css('width', width);
  $('#player').get(0).volume = 0.1;
  $.app.playerAction = 'play';

  $('#player_wrapper #album_artwork').attr('src', '/images/nothumb.png');
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

function getMetroLyricsURL(muFile){
  var name = getPrettySongName(muFile).split(' ').join('-');
  var artist = muFile.artist.split(' ').join('-');
  
  return ('http://www.metrolyrics.com/'+name+'-lyrics-'+artist+'.html');
}

function getSongEntryHtml(muFile, asSearchResult) {
  var name = getPrettySongName(muFile);
  var entryHTML = '<div class="entry">'+
    '&nbsp;&nbsp;'+
    '<span class="song_name">'+getPrettySongName(muFile)+'</span>'+
    '&nbsp;&nbsp;'+
    '<span class="album_name">'+muFile.album+'</span>'+
    '&nbsp;&nbsp;'+
    '<span class="artist_name">'+muFile.artist+'</span>'+
    '&nbsp;&nbsp;'+
    (asSearchResult ?
      '<span class="entry_action">+</span>' :
      '<span class="remove_action">-</span>'+
      '<span class="entry_action">&gt;</span>')+
  '</div>';
  var entry = $(entryHTML);
  
  entry
    .hover(
      function () { $(this).addClass('focused_entry'); },
      function () { $(this).removeClass('focused_entry'); }
    )
    .find('.entry_action').data('muFile',muFile);

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
}

function updateSongInfo(muFile){
  var songInfo = $('#player_column #player_controls #song_info');
  var yt = '<a href='+getYoutubeSearchURL(muFile)+' target="blank"><img src="/images/youtube.ico" /></a>';
  var wiki = '<a href='+getArtistWikipediaURL(muFile)+' target="blank"><img src="/images/wikipedia.ico" /></a>';
  var amzn = '<a href='+getAmazonLink(muFile)+' target="blank"><img src="/images/amazon.png" /></a>';
  var lyrics = '<a href='+getMetroLyricsURL(muFile)+' target="blank"><img src="/images/metro.png" /><a/>';
  $('#title', songInfo).text(muFile.title).attr('title', muFile.title);
  $('#artist', songInfo).text(muFile.artist).attr('title', muFile.artist);
  $('#album', songInfo).text(muFile.album).attr('title', muFile.album);
  $('#extern', songInfo).html(yt+wiki+amzn+lyrics);
  
}

var currentPlaying = null;
$.app.prevSong = function () {
  var prevDiv = currentPlaying.prev();
  if(prevDiv.length == 0) {
    prevDiv = currentPlaying.parent().children().last();
  }
  playMedia(prevDiv);
}

$.app.nextSong = function () {
  var nextDiv = currentPlaying.next();
  if(nextDiv.length == 0) {
    nextDiv = currentPlaying.parent().children().first();
  }
  playMedia(nextDiv);
}

function animateSeeker() {
    var player = $('#player').get(0);

    var degree = (player.currentTime/player.duration)*360;

    $.app.ctx.beginPath();  
    $.app.ctx.clearRect(0,0,$.app.canvas.width,$.app.canvas.height);
    $.app.ctx.strokeStyle = 'rgba(00, 194, 256, 0.9)';
    $.app.ctx.lineWidth = 14;
    $.app.ctx.arc(75,75,65,Math.PI*(270/180),Math.PI*(degree+270)/180);
    $.app.ctx.shadowOffsetX = 0;
    $.app.ctx.shadowOffsetY = 0;
    $.app.ctx.shadowBlur = 5;
    $.app.ctx.shadowColor = 'rgba(170,170,170,0.7)';
    $.app.ctx.stroke();

    $.app.ctx.closePath();

    setTimeout(animateSeeker, 1000);
}

function pauseMedia() {
  $('#player').get(0).pause();
}

function playMedia(div, resumeFlag) {
  if(!div){
    if($('#playlist', '#playlist_wrapper').is(':empty')){
      alert('No selction made.');
      return;
    } else { 
      div = $('.entry', '#playlist').first();
      resumeFlag = false;
    }
  }
  var muFile = div.find('.entry_action').data('muFile');
  var url = getObjectURL(muFile.path);
  
  if(url) {
    if(!resumeFlag) { $('#player').get(0).src = url; }

    var wrapper_height = $('#player_wrapper').height()-30;
    var wrapper_width = $('#player_wrapper').width()-30;

    $('#player').get(0).play();
    currentPlaying = div;
    currentPlaying.parent().children().removeClass('active_entry');
    currentPlaying.addClass('active_entry');
    searchImage(muFile.album+' '+muFile.artist,function (tbUrl) {
      $('#player_wrapper #album_artwork').attr('src',tbUrl);
      var height = $('#player_wrapper #album_artwork').height();
      var width = $('#player_wrapper #album_artwork').width();

      if(height > wrapper_height || width > wrapper_width){
        var ratio, new_height, new_width;
        if(height > wrapper_height){
          ratio = width/height;
          new_height = wrapper_height;
          new_width = ratio*new_height;
        } else {
          ratio = height/width;
          new_width = wrapper_width;
          new_height = ratio*new_width;
        } 
        $('#player_wrapper img').css('height', new_height);
        $('#player_wrapper img').css('width', new_width);
      }

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

  $('#play', '#player_column')
    .hover(
      function () {
        $('img', this)
          .attr('src', '/images/'+$.app.playerAction+'_hover.png');
      },
      function () {       
        $('img', this)
          .attr('src', '/images/'+$.app.playerAction+'.png');
      }
    )
    .click(function () {
      if($.app.playerAction == 'play'){
        playMedia(currentPlaying, true);
      } else {
        pauseMedia();
      } 
    });

  $('#prev', '#player_column')
    .hover(
      function (){
        $('img', this).attr('src', '/images/previous_hover.png');
      }, 
      function (){
        $('img', this).attr('src', '/images/previous.png');
      }
    )
    .click(function (){
      $.app.prevSong(); 
    });

  $('#next', '#player_column')
    .hover(
      function (){
        $('img', this).attr('src', '/images/next_hover.png');
      }, 
      function (){
        $('img', this).attr('src', '/images/next.png');
      }
    )
    .click(function (){
      $.app.nextSong(); 
    });

  $('#player', '#player_column')
    .bind('play', function () {
      $.app.playerAction = 'pause';
      $('img', '#play').attr('src', '/images/pause.png');
      animateSeeker();
    })
    .bind('pause', function () {
      $.app.playerAction = 'play';
      $('img', '#play').attr('src', '/images/play.png');
    });

  $('#player_volume').slider({
    'range' : 'min',
    'value' : 10,
    'min' : 0.0,
    'max' : 100,
    'slide' : function (e, ui){
      $('#player').get(0).volume = (ui.value)/100;
    }
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

    divResults.find('.entry_action')
      .click(function () {
        var muFile = $(this).data('muFile');
        var player_entry = getSongEntryHtml(muFile, false);
        player_entry.find('.entry_action').click(function () {
          playMedia($(this).parent());
        });
        player_entry.find('.remove_action').click(function () {
          playMedia($(this).parent().remove());
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


