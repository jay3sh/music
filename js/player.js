(function ($){
var app = $.app;
var prevDegree = 0;

function player () {}

function updateSongInfo(muFile){
  var songInfo = $('#player_column #player_controls #song_info');
  var yt = '<a href='+app.utils.getYoutubeSearchURL(muFile)+' target="blank"><img src="/images/youtube.ico" /></a>';
  var wiki = '<a href='+app.utils.getArtistWikipediaURL(muFile)+' target="blank"><img src="/images/wikipedia.ico" /></a>';
  var amzn = '<a href='+app.utils.getAmazonLink(muFile)+' target="blank"><img src="/images/amazon.png" /></a>';
  var lyrics = '<a href='+app.utils.getLyricsSearchURL(muFile)+' target="blank"><img src="/images/metro.png" /><a/>';
  $('#title', songInfo).text(muFile.title).attr('title', muFile.title);
  $('#artist', songInfo).text(muFile.artist).attr('title', muFile.artist);
  $('#album', songInfo).text(muFile.album).attr('title', muFile.album);
  $('#extern', songInfo).html(yt+wiki+amzn+lyrics);
}

function animateSeeker() {
  var player = $('#player').get(0);

  var degree = (player.currentTime/player.duration)*360;

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
  var prevDiv = this.currentPlaying.prev();
  prevDegree = 0;
  if(prevDiv.length == 0) {
    prevDiv = this.currentPlaying.parent().children().last();
  }
  this.playMedia(prevDiv);
}

player.nextSong = function () {
  var nextDiv = this.currentPlaying.next();
  prevDegree = 0;
  if(nextDiv.length == 0) {
    nextDiv = this.currentPlaying.parent().children().first();
  }
  this.playMedia(nextDiv);
}

player.pauseMedia = function () {
  $('#player').get(0).pause();
}

player.playMedia = function (div, resumeFlag) {
  var thisref = this;

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
  var url = app.utils.getObjectURL(muFile.path);
  
  if(url) {
    if(!resumeFlag) { $('#player').get(0).src = url; }

    var wrapper_height = $('#player_wrapper').height()-30;
    var wrapper_width = $('#player_wrapper').width()-30;

    $('#player', thisref.jqelem).get(0).play();
    this.currentPlaying = div;
    this.currentPlaying.parent().children().removeClass('active_entry');
    this.currentPlaying.addClass('active_entry');
    app.utils.searchImage(muFile.album+' '+muFile.artist,function (tbUrl) {
      $('#album_artwork', thisref.jqelem).attr('src',tbUrl);
      var height = $('#album_artwork', thisref.jqelem).height();
      var width = $('#album_artwork', thisref.jqelem).width();

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
        $('#player_wrapper img', thisref.jqelem)
          .css({ 'height': new_height,'width': new_width });
      }

    });
    updateSongInfo(muFile);
  } else {
    alert('Add music again');
  }
}

player.init = function (jqelem) {
  var thisref = this;
  thisref.jqelem = jqelem;
  thisref.action = 'play';
  thisref.currentPlaying = null;
  $('#player', thisref.jqelem).get(0).volume = 0.1;
  $('#album_artwork', thisref.jqelem).attr('src', '/images/nothumb.png');

  $('#play', thisref.jqelem)
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
        thisref.playMedia(thisref.currentPlaying, true);
      } else {
        thisref.pauseMedia();
      } 
    });

  $('#prev', thisref.jqelem)
    .hover(
      function (){
        $('img', this).attr('src', '/images/previous_hover.png');
      }, 
      function (){
        $('img', this).attr('src', '/images/previous.png');
      }
    )
    .click(function (){
      thisref.prevSong(); 
    });

  $('#next', thisref.jqelem)
    .hover(
      function (){
        $('img', this).attr('src', '/images/next_hover.png');
      }, 
      function (){
        $('img', this).attr('src', '/images/next.png');
      }
    )
    .click(function (){
      thisref.nextSong(); 
    });

  $('#player', thisref.jqelem)
    .bind('play', function () {
      player.action = 'pause';
      $('img', '#play').attr('src', '/images/pause.png');
      animateSeeker();
    })
    .bind('pause', function () {
      player.action = 'play';
      $('img', '#play').attr('src', '/images/play.png');
    });

  $('#player_volume', thisref.jqelem).slider({
    'range' : 'min',
    'value' : 10,
    'min' : 0.0,
    'max' : 100,
    'slide' : function (e, ui){
      $('#player', thisref.jqelem).get(0).volume = (ui.value)/100;
    }
  });
};

app.player = player;  

})(jQuery)
