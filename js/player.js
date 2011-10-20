(function ($){
var app = $.app;
var prevDegree = 0;
var currentPlaying = null;

function player () {}

function updateSongInfo(muFile){
  var songInfo = $('#player_column #player_controls #song_info');
  var yt = '<a href='+app.utils.getYoutubeSearchURL(muFile)+' target="blank"><img src="/images/youtube.ico" /></a>';
  var wiki = '<a href='+app.utils.getArtistWikipediaURL(muFile)+' target="blank"><img src="/images/wikipedia.ico" /></a>';
  var amzn = '<a href='+app.utils.getAmazonLink(muFile)+' target="blank"><img src="/images/amazon.png" /></a>';
  var lyrics = '<a href='+app.utils.getLyricsSearchURL(muFile)+' target="blank"><img src="/images/metro.png" /><a/>';
  $('#title_info .title', songInfo).text(muFile.title).attr('title', muFile.title);
  $('#artist_info .title', songInfo).text(muFile.artist).attr('title', muFile.artist);
  $('#album_info .title', songInfo).text(muFile.album).attr('title', muFile.album);
  $('#title_info .extern', songInfo).html(yt+lyrics);
  $('#artist_info .extern', songInfo).html(wiki+amzn);
}

function animateSeeker() {
  var player = $('#player').get(0);
  var degree = (player.currentTime/player.duration)*360;

  if(player.currentTime == 0){ prevDegree = 0; }

  if((degree-prevDegree)>1){
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
    prevDegree = degree;
  }
  window.webkitRequestAnimationFrame(animateSeeker);
}

player.prevSong = function () {
  var prevDiv = currentPlaying.prev();
  if(prevDiv.length == 0) {
    prevDiv = currentPlaying.parent().children().last();
  }
  player.playMedia(prevDiv);
}

player.nextSong = function () {
  var nextDiv = currentPlaying.next();
  if(nextDiv.length == 0) {
    nextDiv = currentPlaying.parent().children().first();
  }
  player.playMedia(nextDiv);
}

player.pauseMedia = function () {
  $('#player').get(0).pause();
}

player.playMedia = function (div, resumeFlag) {

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
  app.utils.getPlayableURL(muFile.path, function (url) {
    if(url) {
      if(!resumeFlag) { $('#player').get(0).src = url; }

      var wrapper_height = $('#player_wrapper').height()-30;
      var wrapper_width = $('#player_wrapper').width()-30;

      $('#player', player.jqelem).get(0).play();
      currentPlaying = div;
      currentPlaying.parent().children().removeClass('active_entry');
      currentPlaying.addClass('active_entry');
      app.utils.searchImage(muFile.album,muFile.artist,function (tbUrl) {
        $('#album_artwork', player.jqelem).attr('src',tbUrl);
        var height = $('#album_artwork', player.jqelem).height();
        var width = $('#album_artwork', player.jqelem).width();

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
          $('#player_wrapper img', player.jqelem)
            .css({ 'height': new_height,'width': new_width });
        }

      });
      updateSongInfo(muFile);
    } else {
      alert('Add music again');
    }
  });
  
}

player.saveVolume = function () {
  window.localStorage.setItem('__volume__', $('#player').get(0).volume); 
}

player.loadVolume = function () {
  var localVolume = window.localStorage.getItem('__volume__');
  localVolume = localVolume == null ? 0.3 : JSON.parse(localVolume); 
  $('#player').get(0).volume = localVolume;
  return localVolume*100; 
}

player.init = function (jqelem) {
  player.jqelem = jqelem;
  player.action = 'play';
  $('#album_artwork', player.jqelem).attr('src', '/images/nothumb.png');

  $('#play', player.jqelem)
    .hover(
      function () {
        $('img', this)
          .attr('src', '/images/'+player.action+'_hover.png');
      },
      function () {       
        $('img', this)
          .attr('src', '/images/'+player.action+'.png');
      }
    )
    .click(function () {
      if(player.action == 'play'){
        player.playMedia(currentPlaying, true);
      } else {
        player.pauseMedia();
      } 
    });

  $('#prev', player.jqelem)
    .hover(
      function (){
        $('img', this).attr('src', '/images/previous_hover.png');
      }, 
      function (){
        $('img', this).attr('src', '/images/previous.png');
      }
    )
    .click(function (){
      player.prevSong(); 
    });

  $('#next', player.jqelem)
    .hover(
      function (){
        $('img', this).attr('src', '/images/next_hover.png');
      }, 
      function (){
        $('img', this).attr('src', '/images/next.png');
      }
    )
    .click(function (){
      player.nextSong(); 
    });

  $('#player', player.jqelem)
    .bind('ended', function (e){
      $.app.player.nextSong(); 
    })
    .bind('play', function () {
      player.action = 'pause';
      $('img', '#play').attr('src', '/images/pause.png');
      animateSeeker();
    })
    .bind('pause', function () {
      player.action = 'play';
      $('img', '#play').attr('src', '/images/play.png');
    });

  $('#player_volume', player.jqelem).slider({
    'range' : 'min',
    'value' : player.loadVolume(),
    'min' : 0.0,
    'max' : 100,
    'slide' : function (e, ui){
      $('#player', player.jqelem).get(0).volume = (ui.value)/100;
    }
  });
};

app.player = player;  

})(jQuery)
