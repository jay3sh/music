(function ($){
  var app = $.app;

  function Playlist(){}

  function populatePlaylist(key){
    var favPlaylists = 
      JSON.parse(window.localStorage.getItem('__fav_playlist__')); 
    var hashes = favPlaylists[key];
    $('#playlist').empty();
    _.each(hashes, function (hash){
      muFile = JSON.parse(window.localStorage.getItem(hash));
      player_entry = app.utils.getSongEntryHTML(muFile);
      Playlist.attachEntryControls(player_entry); 
      app.Playlist.add(player_entry);
    });
  }

  function saveFavPlaylist(name){
    var playlist_entries = [];
    var hash;
    if(!_.isUndefined(Playlist.favPlaylists[name])){
      if(!confirm('There is already a playlist with this name. Do you want to replace it?')) { return; }
    }
    $('.entry', '#playlist').each(function(){
      hash = $.MD5($('.entry_action', this).data('muFile').path); 
      playlist_entries.push(hash); 
    }); 
    app.Playlist.favPlaylists[name] = playlist_entries;
    window.localStorage.setItem('__fav_playlist__', 
      JSON.stringify(app.Playlist.favPlaylists));
  }

  function loadFavPlaylist(){
    var favPlaylists = 
      JSON.parse(window.localStorage.getItem('__fav_playlist__')); 
    return (_.isNull(favPlaylists) ? {} : favPlaylists);
  }

  Playlist.populatePlaylistDropdown = function () {
    $('#playlist_dropdown').empty();
    $('#playlist_dropdown').append(
      '<option value="no selection">--Select Playlist--</option>');
    _.each(app.Playlist.favPlaylists, function (playlist, key){
      var option = $('<option></option>').text(key).attr('value', key);
      $('#playlist_dropdown').append(option);
    }); 
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
      $.app.player.playMedia($(this).parent(), false, true);
    });
    entry.find('.remove_action').click(function () {
      $.app.Playlist.remove($(this).parent());
    }); 
  }

  Playlist.init = function () {
    $.event.props.push('dataTransfer');

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
      $('input[name=save_playlist_text]').val('');
    });
    $('#submit_playlist').click(function () {
      $('#save_box').slideToggle(); 
      saveFavPlaylist($('input[name="save_playlist_text"]').val());
      Playlist.populatePlaylistDropdown(); 
      app.mainColumn.populatePlaylistSettings();
    });
    $('select', '#playlist_controls').change(function () {
      var div = $('select option:selected').each(function () {
        populatePlaylist($(this).val());
      });
    });
    $('#save_box img').click(function () {
      $('#save_box').slideToggle(); 
    });

    Playlist.favPlaylists = loadFavPlaylist();
    Playlist.populatePlaylistDropdown();
    Playlist.loadCurrentPlaylist();
  }
 
 app.Playlist = Playlist;
})(jQuery);

