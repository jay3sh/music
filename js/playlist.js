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
    if(_.isNull(playlist)) { return; } 
    var muFile, player_entry;
    var thisref = this;
    $.event.props.push('dataTransfer');
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

  Playlist.init = function () {
    $('#clear_playlist', '#playlist_wrapper').click(function (){
      $('#playlist', '#playlist_wrapper').empty();
    }); 
    $('#shuffle_playlist', '#playlist_wrapper').click(function () {
      if(app.Playlist.shuffle) { 
        app.Playlist.shuffle = false; 
        $(this).css('opacity', '0.5');
      }
      else { 
        app.Playlist.shuffle = true;
        $(this).css('opacity', '1.0');
      }
    });
    Playlist.loadPlaylist();
  }
 
 app.Playlist = Playlist;
})(jQuery);

