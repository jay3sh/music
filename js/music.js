
google.load('search', '1');


$(document).ready(function () {
  $.app.Skin.init();
  if(_.isNull(window.localStorage.getItem('__name_index__'))){
    $.app.Skin.showHomeScreen();
  } 
  else {  
    $.app.Skin.showPlayerScreen();
  }

  $.app.utils.checkSupport();

});

window.onbeforeunload =  function () {
  $.app.Playlist.storeCurrentPlaylist();
  $.app.player.saveVolume();
}

