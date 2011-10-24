(function ($){
  var app = $.app;

  function Playlist(){}

  function savePlaylist(name) {
    var playlist_entries = [];
    var hash;
    var playlist = {};
    $('.entry', '#playlist').each(function(){
      hash = $.MD5($('.entry_action', this).data('muFile').path); 
      playlist_entries.push(hash); 
    }); 
    playlist[name] = playlist_entries;
    window.localStorage.setItem('__fav_playlist__', JSON.stringify(playlist));
  }

  Playlist.storeCurrentPlaylist = function () {
    var playlist_entries = [];
    var hash;
    $('.entry', '#playlist').each(function(){
      hash = $.MD5($('.entry_action', this).data('muFile').path); 
      playlist_entries.push(hash); 
    }); 
    window.localStorage.setItem('__current_playlist__', JSON.stringify(playlist_entries));
  };
  
  Playlist.add = function (entry) {
    $('#playlist', '#playlist_wrapper').append(entry);
  }

  Playlist.remove = function (entry) {
    entry.remove();
  }
  
  Playlist.loadCurrentPlaylist = function () {
    var playlist = JSON.parse(window.localStorage.getItem('__current_playlist__'));
    if(_.isNull(playlist)) { return; } 
    var muFile, player_entry;
    var thisref = this;
    $.event.props.push('dataTransfer');
    window.localStorage.removeItem('__current_playlist__');

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
    $('#save_playlist', '#playlist_wrapper').click(function () {
      $('#save_box').slideToggle(); 
      $('input[name=save_playlist_text]', '#playlist_wrapper').focus();
    });
    $('#save_playlist_button').click(function () {
      $('#save_box').slideToggle(); 
      savePlaylist($('input[name=save_playlist_text]').val());
    });
    Playlist.loadCurrentPlaylist();
  }
 
 app.Playlist = Playlist;
})(jQuery);

