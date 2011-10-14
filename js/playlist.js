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
 
 app.Playlist = Playlist;
})(jQuery);

