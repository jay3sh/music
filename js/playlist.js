(function ($){
  var app = $.app;

  function Playlist(){}

  Playlist.storePlaylist = function () {
    var playlist_entries = [];
    var hash;
    $('.entry', '#playlist').each(function(){
      hash = $.MD5($('.entry_action', this).data('muFile').path); 
      playlist_entries.push(hash); 
    }); 
    window.localStorage.setItem('__playlist__', JSON.stringify(playlist_entries));
  };
  
  Playlist.add = function (entry) {
    $('#playlist', '#playlist_wrapper').append(entry);
  }

  Playlist.remove = function (entry) {
    entry.remove();
  }
  
  Playlist.loadPlaylist = function () {
    var playlist = JSON.parse(window.localStorage.getItem('__playlist__'));
    var muFile, player_entry;
    var thisref = this;
    window.localStorage.removeItem('__playlist__');

    _.each(playlist, function (hash){
      muFile = JSON.parse(window.localStorage.getItem(hash));
      player_entry = app.utils.getSongEntryHTML(muFile);
      thisref.attachEntryControls(player_entry); 
      app.Playlist.add(player_entry);
    });
  }

  Playlist.attachEntryControls = function (entry) {
    entry.find('.entry_action').click(function () {
      $.app.player.playMedia($(this).parent());
    });
    entry.find('.remove_action').click(function () {
      $.app.Playlist.remove($(this).parent());
    }); 
  }
 
 app.Playlist = Playlist;
})(jQuery);

