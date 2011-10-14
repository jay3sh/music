(function ($){
var app = $.app;

function player () {}

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

player.prevSong = function () {
  var prevDiv = this.currentPlaying.prev();
  if(prevDiv.length == 0) {
    prevDiv = this.currentPlaying.parent().children().last();
  }
  this.playMedia(prevDiv);
}

player.nextSong = function () {
  var nextDiv = this.currentPlaying.next();
  if(nextDiv.length == 0) {
    nextDiv = this.currentPlaying.parent().children().first();
  }
  this.playMedia(nextDiv);
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
  var url = getObjectURL(muFile.path);
  
  if(url) {
    if(!resumeFlag) { $('#player').get(0).src = url; }

    var wrapper_height = $('#player_wrapper').height()-30;
    var wrapper_width = $('#player_wrapper').width()-30;

    $('#player').get(0).play();
    this.currentPlaying = div;
    this.currentPlaying.parent().children().removeClass('active_entry');
    this.currentPlaying.addClass('active_entry');
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

player.init = function () {
  var thisref = this;
  thisref.action = 'play';
  thisref.currentPlaying = null;
  $('#player').get(0).volume = 0.1;
  $('#player_wrapper #album_artwork').attr('src', '/images/nothumb.png');

  $('#play', '#player_column')
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
      thisref.prevSong(); 
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
      thisref.nextSong(); 
    });

  $('#player', '#player_column')
    .bind('play', function () {
      player.action = 'pause';
      $('img', '#play').attr('src', '/images/pause.png');
      animateSeeker();
    })
    .bind('pause', function () {
      player.action = 'play';
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
};

app.player = player;  
})(jQuery)
